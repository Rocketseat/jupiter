import { randomUUID } from 'node:crypto'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { compile, Cue } from 'node-webvtt'
import { z } from 'zod'

import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'

const createSubtitlesFromTranscription = z.object({
  videoId: z.string().uuid(),
})

export const maxDuration = 300

async function handler(request: NextRequest) {
  const webhookId = randomUUID()
  const body = await request.json()

  const { videoId } = createSubtitlesFromTranscription.parse(body)

  try {
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
      include: {
        transcription: {
          include: {
            segments: {
              orderBy: {
                start: 'asc',
              },
            },
          },
        },
      },
    })

    if (video.subtitlesStorageKey) {
      return NextResponse.json(
        { message: 'Video subtitles has already been generated.' },
        {
          status: 409,
        },
      )
    }

    if (!video.externalProviderId) {
      return NextResponse.json(
        { message: 'Video was not uploaded to external provider yet.' },
        {
          status: 400,
        },
      )
    }

    if (!video.transcription) {
      return NextResponse.json(
        { message: 'Video transcription was not generated.' },
        {
          status: 400,
        },
      )
    }

    await prisma.webhook.create({
      data: {
        id: webhookId,
        type: 'CREATE_SUBTITLES_FROM_TRANSCRIPTION',
        videoId,
        metadata: JSON.stringify({ videoId }),
      },
    })

    const subtitlesStorageKey = `batch-${video.uploadBatchId}/${videoId}.vtt`

    const segments: Cue[] = video.transcription.segments
      .map((segment) => {
        return {
          start: segment.start.toNumber(),
          end: segment.end.toNumber(),
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

    const base64vtt = Buffer.from(vtt).toString('base64')

    await Promise.all([
      await r2.send(
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
          Key: subtitlesStorageKey,
          Body: vtt,
          ContentType: 'text/vtt',
        }),
      ),
      await axios.post(
        `https://api-v2.pandavideo.com.br/subtitles/${videoId}`,
        {
          label: 'Português',
          srclang: 'pt-br',
          file: `data:text/vtt;name=${videoId}.vtt;base64,${base64vtt}`,
        },
        {
          headers: {
            Authorization: env.PANDAVIDEO_API_KEY,
          },
        },
      ),
    ])

    await prisma.$transaction([
      prisma.video.update({
        where: {
          id: videoId,
        },
        data: {
          subtitlesStorageKey,
        },
      }),
      prisma.webhook.update({
        where: {
          id: webhookId,
        },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
        },
      }),
    ])

    return new NextResponse(null, { status: 201 })
  } catch (err: unknown) {
    await prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        status: 'ERROR',
        finishedAt: new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Error creating subtitles.', error: err },
      { status: 400 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
