import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { publishMessage } from '@/lib/qstash'

const createBatchSchema = z.object({
  files: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        duration: z.number(),
        sizeInBytes: z.number(),
        tags: z.array(z.string()).min(1),
      }),
    )
    .min(0),
})

export async function POST(request: Request) {
  const requestBody = await request.json()
  const { files } = createBatchSchema.parse(requestBody)

  const batchId = randomUUID()

  try {
    await prisma.$transaction(async (tx) => {
      const videos: Prisma.VideoCreateManyUploadBatchInput[] = files.map(
        (file, index) => {
          return {
            id: randomUUID(),
            uploadOrder: index + 1,
            title: file.title,
            storageKey: `inputs/${file.id}.mp4`,
            audioStorageKey: `inputs/${file.id}.mp3`,
            sizeInBytes: file.sizeInBytes,
            duration: file.duration,
          }
        },
      )

      await tx.uploadBatch.create({
        data: {
          id: batchId,
          videos: {
            createMany: {
              data: videos,
            },
          },
        },
      })

      await Promise.all(
        videos.map(async (video) => {
          await publishMessage({
            topic: 'jupiter.upload-created',
            body: {
              videoId: video.id,
            },
          })
        }),
      )
    })

    return NextResponse.json({ batchId })
  } catch (err) {
    console.log(err)
  }
}
