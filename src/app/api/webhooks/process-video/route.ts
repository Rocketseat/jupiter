import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { CopyObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { publishMessage, validateQStashSignature } from '@/lib/qstash'

const processVideoBodySchema = z.object({
  videoId: z.string().uuid(),
})

export async function POST(request: Request) {
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

    const bucket = env.CLOUDFLARE_BUCKET_NAME

    const storageKey = `uploads/batch-${video.uploadBatchId}/${video.id}.mp4`
    const audioStorageKey = `uploads/batch-${video.uploadBatchId}/${video.id}.mp3`

    const copyVideoAndAudioPromises = [
      r2.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${video.storageKey}`,
          Key: storageKey,
        }),
      ),
      r2.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${video.audioStorageKey}`,
          Key: audioStorageKey,
        }),
      ),
    ]

    await Promise.all(copyVideoAndAudioPromises)

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        processedAt: new Date(),
        storageKey,
        audioStorageKey,
      },
    })

    await publishMessage({
      topic: 'jupiter.upload-processed',
      body: {
        videoId,
      },
    })

    return new Response()
  } catch (err: any) {
    console.error(err)

    return NextResponse.json(
      { message: 'Error processing video.', error: err?.message || '' },
      { status: 401 },
    )
  }
}
