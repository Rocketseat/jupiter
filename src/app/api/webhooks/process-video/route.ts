import { randomUUID } from 'node:crypto'

import { CopyObjectCommand } from '@aws-sdk/client-s3'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { db } from '@/drizzle/client'
import { video, webhook } from '@/drizzle/schema'
import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { publishMessage } from '@/lib/qstash'

const processVideoBodySchema = z.object({
  videoId: z.string().uuid(),
})

export const maxDuration = 60

async function handler(request: NextRequest) {
  const webhookId = randomUUID()

  const body = await request.json()

  try {
    const { videoId } = processVideoBodySchema.parse(body)

    const sourceVideo = await db.query.video.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, videoId)
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

    if (sourceVideo.processedAt) {
      return NextResponse.json({
        message: 'Video has already been processed.',
      })
    }

    await db.insert(webhook).values({
      id: webhookId,
      type: 'PROCESS_VIDEO',
      videoId,
      metadata: JSON.stringify({ videoId }),
    })

    const storageKey = `batch-${sourceVideo.uploadBatchId}/${sourceVideo.id}.mp4`
    const audioStorageKey = `batch-${sourceVideo.uploadBatchId}/${sourceVideo.id}.mp3`

    const moveVideoFilePromise = r2.send(
      new CopyObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${sourceVideo.id}.mp4`,
        Key: storageKey,
      }),
    )

    const moveAudioFilePromise = r2.send(
      new CopyObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${sourceVideo.id}.mp3`,
        Key: audioStorageKey,
      }),
    )

    await Promise.all([moveVideoFilePromise, moveAudioFilePromise])

    await db.transaction(async (tx) => {
      await tx
        .update(video)
        .set({ processedAt: new Date(), storageKey, audioStorageKey })
        .where(eq(video.id, videoId))

      await tx
        .update(webhook)
        .set({
          status: 'SUCCESS',
          finishedAt: new Date(),
        })
        .where(eq(webhook.id, webhookId))
    })

    await publishMessage({
      topic: 'jupiter.upload-processed',
      body: {
        videoId,
      },
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
      { message: 'Error processing video.', error: err },
      { status: 400 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
