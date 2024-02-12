import { db } from '@nivo/drizzle'
import { tagToUpload, upload, uploadBatch } from '@nivo/drizzle/schema'
import { publishEvent } from '@nivo/qstash'
import { publishWebhookEvents } from '@nivo/webhooks'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const uploadsBatchesRouter = createTRPCRouter({
  getUploadBatch: protectedProcedure
    .input(
      z.object({
        batchId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const { batchId } = input

      const batch = await db.query.uploadBatch.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, batchId)
        },
        with: {
          uploads: {
            with: {
              transcription: {
                columns: {
                  id: true,
                },
              },
              author: {
                columns: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy(fields, { asc }) {
              return asc(fields.uploadOrder)
            },
          },
        },
      })

      if (!batch) {
        throw new TRPCError({
          message: 'Batch not found.',
          code: 'BAD_REQUEST',
        })
      }

      return { batch }
    }),

  createUploadBatch: protectedProcedure
    .input(
      z.object({
        files: z
          .array(
            z.object({
              id: z.string(),
              title: z.string().min(1),
              language: z.enum(['pt', 'es']),
              duration: z.number(),
              sizeInBytes: z.number(),
              tags: z.array(z.string()).min(1),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId, id: userId } = ctx.session.user
      const { files: videos } = input

      const { batchId } = await db.transaction(async (tx) => {
        const [{ id: batchId }] = await tx
          .insert(uploadBatch)
          .values({
            companyId,
            authorId: userId,
          })
          .returning({
            id: uploadBatch.id,
          })

        await tx.insert(upload).values(
          videos.map((videoItem, index) => {
            return {
              id: videoItem.id,
              language: videoItem.language,
              uploadBatchId: batchId,
              uploadOrder: index + 1,
              title: videoItem.title,
              sizeInBytes: videoItem.sizeInBytes,
              duration: videoItem.duration,
              companyId,
              authorId: userId,
            }
          }),
        )

        const tagsOnVideos = await tx.query.tag.findMany({
          where(fields, { inArray }) {
            return inArray(
              fields.slug,
              videos.flatMap((videoItem) => videoItem.tags),
            )
          },
        })

        const tagSlugToId = tagsOnVideos.reduce((map, item) => {
          return map.set(item.slug, item.id)
        }, new Map<string, string>())

        const tagToUploads = videos.flatMap((videoItem) => {
          return videoItem.tags.map((videoTag) => {
            const tagId = tagSlugToId.get(videoTag)

            if (!tagId) {
              throw new Error(`Tag with slug "${videoTag}" was not found.`)
            }

            return {
              tagId,
              uploadId: videoItem.id,
            }
          })
        })

        await tx.insert(tagToUpload).values(tagToUploads)

        return { batchId }
      })

      await publishWebhookEvents({
        companyId,
        trigger: 'upload.created',
        events: videos.map((video) => {
          return {
            id: video.id,
            description: null,
            duration: video.duration,
            title: video.title,
            tags: video.tags,
            streamUrl: null,
          }
        }),
      })

      await Promise.all(
        videos.map((video) => {
          return publishEvent({
            event: 'PROCESS_VIDEO',
            payload: { videoId: video.id },
          })
        }),
      )

      return { batchId }
    }),
})
