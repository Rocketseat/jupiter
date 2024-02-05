import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { tagToVideo, uploadBatch, video } from '@/drizzle/schema'
import { publishMessagesOnTopic } from '@/lib/kafka'
import { publishMessage } from '@/lib/qstash'

import { authentication } from './authentication'

export const createUploadBatch = new Elysia().use(authentication).post(
  '/batches',
  async ({ body, set, getCurrentUser }) => {
    const { companyId } = await getCurrentUser()
    const { files: videos } = body

    const { batchId } = await db.transaction(async (tx) => {
      const [{ id: batchId }] = await tx
        .insert(uploadBatch)
        .values({
          companyId,
        })
        .returning({
          id: uploadBatch.id,
        })

      await tx.insert(video).values(
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

      const tagToVideos = videos.flatMap((videoItem) => {
        return videoItem.tags.map((videoTag) => {
          const tagId = tagSlugToId.get(videoTag)

          if (!tagId) {
            throw new Error(`Tag with slug "${videoTag}" was not found.`)
          }

          return {
            a: tagId,
            b: videoItem.id,
          }
        })
      })

      await tx.insert(tagToVideo).values(tagToVideos)

      return { batchId }
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
