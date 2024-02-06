import { randomUUID } from 'node:crypto'

import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import axios from 'axios'
import { BunnyCdnStream } from 'bunnycdn-stream'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { db } from '@/drizzle/client'
import { video, webhook } from '@/drizzle/schema'
import { env } from '@/env'

const createTranscriptionBodySchema = z.object({
  videoId: z.string().uuid(),
})

export const maxDuration = 300

async function handler(request: NextRequest) {
  const webhookId = randomUUID()

  const body = await request.json()

  try {
    const { videoId } = createTranscriptionBodySchema.parse(body)

    const sourceVideo = await db.query.video.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, videoId)
      },
      with: {
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

    if (!sourceVideo.processedAt || !sourceVideo.storageKey) {
      return NextResponse.json(
        { message: "Video hasn't processed yet." },
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

    if (sourceVideo.externalProviderId) {
      return NextResponse.json(
        { message: 'Video has already been uploaded to external provider.' },
        {
          status: 409,
        },
      )
    }

    await db.insert(webhook).values({
      id: webhookId,
      type: 'UPLOAD_TO_EXTERNAL_PROVIDER',
      videoId,
      metadata: JSON.stringify({ videoId }),
    })

    const bunny = new BunnyCdnStream({
      apiKey: env.BUNNY_API_KEY,
      videoLibrary: sourceVideo.company.externalId,
    })

    const videoDownloadURL = `https://pub-${env.CLOUDFLARE_UPLOAD_BUCKET_ID}.r2.dev/${videoId}.mp4`

    const { data } = await axios.get(videoDownloadURL, {
      responseType: 'stream',
    })

    const { guid: externalProviderId } = await bunny.createAndUploadVideo(
      data,
      { title: 'My new video' },
    )

    await db.transaction(async (tx) => {
      await tx
        .update(video)
        .set({ externalProviderId })
        .where(eq(video.id, videoId))

      await tx
        .update(webhook)
        .set({
          status: 'SUCCESS',
          finishedAt: new Date(),
        })
        .where(eq(webhook.id, webhookId))
    })

    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    await db
      .update(webhook)
      .set({
        status: 'ERROR',
        finishedAt: new Date(),
      })
      .where(eq(webhook.id, webhookId))

    return NextResponse.json(
      { message: 'Error uploading video.', error: err },
      { status: 400 },
    )
  }
}

export const POST = env.QSTASH_VALIDATE_SIGNATURE
  ? handler
  : verifySignatureAppRouter(handler)
