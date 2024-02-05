import { and, eq, inArray } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { tag, tagToVideo, video } from '@/drizzle/schema'
import { publishMessagesOnTopic } from '@/lib/kafka'

import { authentication } from './authentication'
import { UnauthorizedError } from './errors/unauthorized-error'

export const updateUpload = new Elysia().use(authentication).put(
  '/videos/:videoId',
  async ({ params, body, getCurrentUser }) => {
    const { companyId } = await getCurrentUser()
    const { videoId } = params
    const { title, description, tags, commitUrl } = body

    const videoFromUser = await db.query.video.findFirst({
      where(fields, { eq, and }) {
        return and(eq(fields.id, videoId), eq(fields.companyId, companyId))
      },
    })

    if (!videoFromUser) {
      throw new UnauthorizedError()
    }

    const currentVideoTags = await db
      .select({ id: tag.id, slug: tag.slug })
      .from(tag)
      .innerJoin(tagToVideo, eq(tagToVideo.a, tag.id))
      .innerJoin(video, eq(tagToVideo.b, video.id))
      .where(eq(video.id, videoId))

    const currentVideoTagsSlugs = currentVideoTags.map((item) => item.slug)

    const tagsToRemoveIds = currentVideoTags
      .filter((item) => !tags.includes(item.slug))
      .map((item) => item.id)

    const tagsSlugsToAdd = tags.filter((slug) => {
      return !currentVideoTagsSlugs.includes(slug)
    })

    const { duration, externalProviderId } = await db.transaction(
      async (tx) => {
        const [{ duration, externalProviderId }] = await tx
          .update(video)
          .set({
            title,
            description,
            commitUrl,
          })
          .where(eq(video.id, videoId))
          .returning({
            duration: video.duration,
            externalProviderId: video.externalProviderId,
          })

        if (tagsToRemoveIds.length > 0) {
          await tx
            .delete(tagToVideo)
            .where(
              and(
                eq(tagToVideo.b, videoId),
                inArray(tagToVideo.a, tagsToRemoveIds),
              ),
            )
        }

        if (tagsSlugsToAdd.length > 0) {
          const tagsToAdd = await tx.query.tag.findMany({
            columns: {
              id: true,
            },
            where(fields, { inArray }) {
              return inArray(fields.slug, tagsSlugsToAdd)
            },
          })

          const tagsToAddIds = tagsToAdd.map((item) => item.id)

          await tx.insert(tagToVideo).values(
            tagsToAddIds.map((tagId) => {
              return {
                a: tagId,
                b: videoId,
              }
            }),
          )
        }

        return { duration, externalProviderId }
      },
    )

    await publishMessagesOnTopic({
      topic: 'jupiter.video-updated',
      messages: [
        {
          id: videoId,
          duration,
          title,
          commitUrl,
          description,
          externalProviderId,
          tags,
        },
      ],
    })

    return new Response(null, { status: 204 })
  },
  {
    params: t.Object({
      videoId: t.String(),
    }),
    body: t.Object({
      title: t.String({ minLength: 1 }),
      description: t.Nullable(t.String()),
      tags: t.Array(t.String(), { minItems: 1 }),
      commitUrl: t.Nullable(t.String()),
    }),
  },
)
