import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { CopyObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { publishMessage, validateQStashSignature } from '@/lib/qstash'
import { randomUUID } from 'node:crypto'

const processVideoBodySchema = z.object({
  videoId: z.string().uuid(),
})

export async function POST(request: Request) {
  const webhookId = randomUUID()

  try {
    const { bodyAsJSON } = await validateQStashSignature({ request })

    const { videoId } = processVideoBodySchema.parse(bodyAsJSON)

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
        metadata: JSON.stringify(bodyAsJSON),
      },
    })

    const bucket = env.CLOUDFLARE_BUCKET_NAME

    const storageKey = `uploads/batch-${video.uploadBatchId}/${video.id}.mp4`
    const audioStorageKey = `uploads/batch-${video.uploadBatchId}/${video.id}.mp3`

    const moveVideoFilePromise = r2.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${video.storageKey}`,
        Key: storageKey,
      }),
    )

    const moveAudioFilePromise = r2.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${video.audioStorageKey}`,
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

    return new Response()
  } catch (err: any) {
    console.error(err)

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
      { message: 'Error processing video.', error: err?.message || '' },
      { status: 401 },
    )
  }
}
