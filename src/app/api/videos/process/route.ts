import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { CopyObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const processVideoBodySchema = z.object({
  videoId: z.string().uuid(),
})

export async function POST(request: Request) {
  const { videoId } = processVideoBodySchema.parse(await request.json())

  try {
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (video.processedAt) {
      return NextResponse.json(
        { message: 'Video has already been processed.' },
        {
          status: 409,
        },
      )
    }

    const bucket = process.env.CLOUDFLARE_BUCKET_NAME

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

    /**
     * TODO: Add transcription and external provider upload to QStash
     */

    return new Response()
  } catch (err) {
    console.log(err)
  }
}
