import { randomUUID } from 'node:crypto'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import axios from 'axios'
import { BunnyCdnStream } from 'bunnycdn-stream'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { compile, Cue } from 'node-webvtt'
import { z } from 'zod'

import { db } from '@/drizzle/client'
import { video, webhook } from '@/drizzle/schema'
import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'

const createSubtitlesFromTranscription = z.object({
  videoId: z.string().uuid(),
})

export const maxDuration = 300

function b64EncodeUnicode(str: string) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16))
    }),
  )
}

async function handler(request: NextRequest) {
  const webhookId = randomUUID()
  const body = await request.json()

  const { videoId } = createSubtitlesFromTranscription.parse(body)

  try {
    const sourceVideo = await db.query.video.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, videoId)
      },
      with: {
        transcription: {
          with: {
            segments: {
              orderBy(fields, { asc }) {
                return asc(fields.start)
              },
            },
          },
        },
        company: {
          columns: {
            externalId: true,
          },
        },
      },
    })

    if (!sourceVideo) {
      return NextResponse.json(
        { message: 'Video not found.' },
        {
          status: 400,
        },
      )
    }

    if (sourceVideo.subtitlesStorageKey) {
      return NextResponse.json(
        { message: 'Video subtitles has already been generated.' },
        {
          status: 409,
        },
      )
    }

    if (!sourceVideo.externalProviderId) {
      return NextResponse.json(
        { message: 'Video was not uploaded to external provider yet.' },
        {
          status: 400,
        },
      )
    }

    if (!sourceVideo.transcription) {
      return NextResponse.json(
        { message: 'Video transcription was not generated.' },
        {
          status: 400,
        },
      )
    }

    if (!sourceVideo.company.externalId) {
      return NextResponse.json(
        { message: 'Company has no external ID created.' },
        {
          status: 400,
        },
      )
    }

    await db.insert(webhook).values({
      id: webhookId,
      type: 'CREATE_SUBTITLES_FROM_TRANSCRIPTION',
      videoId,
      metadata: JSON.stringify({ videoId }),
    })

    const subtitlesStorageKey = `batch-${sourceVideo.uploadBatchId}/${videoId}.vtt`

    const segments: Cue[] = sourceVideo.transcription.segments
      .map((segment) => {
        return {
          start: Number(segment.start),
          end: Number(segment.end),
          text: segment.text,
          identifier: '',
          styles: '',
        }
      })
      /**
       * Filter cues where "end" and "start" time are equal
       */
      .filter((cue) => {
        return cue.end > cue.start
      })

    const vtt = compile({
      cues: segments,
      valid: true,
      strict: true,
      errors: [],
    })

    const bunny = new BunnyCdnStream({
      apiKey: env.BUNNY_API_KEY,
      videoLibrary: sourceVideo.company.externalId,
    })

    await Promise.all([
      r2.send(
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
          Key: subtitlesStorageKey,
          Body: vtt,
          ContentType: 'text/vtt',
        }),
      ),
      bunny.addCaptions(sourceVideo.externalProviderId, {
        srclang: sourceVideo.language,
        label: sourceVideo.language,
        captionsFile: b64EncodeUnicode(vtt),
      }),
    ])

    await db.transaction(async (tx) => {
      await tx
        .update(video)
        .set({ subtitlesStorageKey })
        .where(eq(video.id, videoId))

      await tx
        .update(webhook)
        .set({
          status: 'SUCCESS',
          finishedAt: new Date(),
        })
        .where(eq(webhook.id, webhookId))
    })

    return new NextResponse(null, { status: 201 })
  } catch (err: unknown) {
    await db
      .update(webhook)
      .set({
        status: 'ERROR',
        finishedAt: new Date(),
      })
      .where(eq(webhook.id, webhookId))

    return NextResponse.json(
      { message: 'Error creating subtitles.', error: err },
      { status: 400 },
    )
  }
}

export const POST = env.QSTASH_VALIDATE_SIGNATURE
  ? handler
  : verifySignatureAppRouter(handler)
