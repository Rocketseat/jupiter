import { randomUUID } from 'node:crypto'

import { CopyObjectCommand } from '@aws-sdk/client-s3'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
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

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (video.processedAt) {
      return NextResponse.json({
        message: 'Video has already been processed.',
      })
    }

    await prisma.webhook.create({
      data: {
        id: webhookId,
        type: 'PROCESS_VIDEO',
        videoId,
        metadata: JSON.stringify(body),
      },
    })

    const storageKey = `batch-${video.uploadBatchId}/${video.id}.mp4`
    const audioStorageKey = `batch-${video.uploadBatchId}/${video.id}.mp3`

    const moveVideoFilePromise = r2.send(
      new CopyObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${video.id}.mp4`,
        Key: storageKey,
      }),
    )

    const moveAudioFilePromise = r2.send(
      new CopyObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${video.id}.mp3`,
        Key: audioStorageKey,
      }),
    )

    await Promise.all([moveVideoFilePromise, moveAudioFilePromise])

    await prisma.$transaction([
      prisma.video.update({
        where: {
          id: videoId,
        },
        data: {
          processedAt: new Date(),
          storageKey,
          audioStorageKey,
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

    await publishMessage({
      topic: 'jupiter.upload-processed',
      body: {
        videoId,
      },
    })

    return new NextResponse(null, { status: 204 })
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
      { message: 'Error processing video.', error: err },
      { status: 400 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
