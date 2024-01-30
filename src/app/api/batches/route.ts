import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { publishMessagesOnTopic } from '@/lib/kafka'
import { prisma } from '@/lib/prisma'
import { publishMessage } from '@/lib/qstash'

const createBatchSchema = z.object({
  files: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        language: z.string(),
        duration: z.number(),
        sizeInBytes: z.number(),
        tags: z.array(z.string()).min(1),
      }),
    )
    .min(0),
})

export async function POST(request: Request) {
  const requestBody = await request.json()
  const { files: videos } = createBatchSchema.parse(requestBody)

  const batchId = randomUUID()

  try {
    await prisma.$transaction(async (tx) => {
      await tx.uploadBatch.create({
        data: {
          id: batchId,
        },
      })

      await Promise.all(
        videos.map((video, index) => {
          return tx.video.create({
            data: {
              id: video.id,
              language: video.language,
              uploadBatchId: batchId,
              uploadOrder: index + 1,
              title: video.title,
              sizeInBytes: video.sizeInBytes,
              duration: video.duration,
              tags: {
                connect: video.tags.map((tag) => {
                  return {
                    slug: tag,
                  }
                }),
              },
            },
          })
        }),
      )
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

    await publishMessagesOnTopic({
      topic: 'jupiter.video-created',
      messages: videos.map((video) => {
        return {
          id: video.id,
          title: video.title,
          duration: video.duration,
          description: null,
          commitUrl: null,
          tags: video.tags,
        }
      }),
    })

    return NextResponse.json({ batchId })
  } catch (err) {
    console.log(err)
  }
}
