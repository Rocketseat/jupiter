import { randomUUID } from 'node:crypto'

import { Elysia, t } from 'elysia'

import { publishMessagesOnTopic } from '@/lib/kafka'
import { prisma } from '@/lib/prisma'
import { publishMessage } from '@/lib/qstash'

export const createUploadBatch = new Elysia().post(
  '/batches',
  async ({ body, set }) => {
    const { files: videos } = body

    const batchId = randomUUID()

    await prisma.$transaction(async (tx) => {
      await tx.uploadBatch.create({
        data: { id: batchId },
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

    set.status = 201

    return { batchId }
  },
  {
    body: t.Object({
      files: t.Array(
        t.Object({
          id: t.String(),
          title: t.String({ minLength: 1 }),
          language: t.String(),
          duration: t.Number(),
          sizeInBytes: t.Number(),
          tags: t.Array(t.String(), { minItems: 1 }),
        }),
        { minItems: 1 },
      ),
    }),
  },
)
