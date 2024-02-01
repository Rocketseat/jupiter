import { Elysia, t } from 'elysia'

import { publishMessagesOnTopic } from '@/lib/kafka'
import { prisma } from '@/lib/prisma'

export const updateUpload = new Elysia().put(
  '/videos/:videoId',
  async ({ params, body }) => {
    const { videoId } = params
    const { title, description, tags, commitUrl } = body

    const { duration, externalProviderId } = await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        title,
        description,
        commitUrl,
        tags: {
          connect: tags.map((tag) => {
            return {
              slug: tag,
            }
          }),
        },
      },
    })

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
