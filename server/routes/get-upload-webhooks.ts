import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'

export const getUploadWebhooks = new Elysia().get(
  '/videos/:videoId/webhooks',
  async ({ params }) => {
    const { videoId } = params

    const webhooks = await db.query.webhook.findMany({
      where(fields, { eq }) {
        return eq(fields.videoId, videoId)
      },
      orderBy(fields, { desc }) {
        return desc(fields.createdAt)
      },
    })

    return { webhooks }
  },
  {
    params: t.Object({
      videoId: t.String(),
    }),
  },
)
