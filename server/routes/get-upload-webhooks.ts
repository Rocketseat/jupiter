import { Elysia, t } from 'elysia'

import { prisma } from '@/lib/prisma'

export const getUploadWebhooks = new Elysia().get(
  '/videos/:videoId/webhooks',
  async ({ params }) => {
    const { videoId } = params

    const webhooks = await prisma.webhook.findMany({
      where: {
        videoId,
      },
      orderBy: {
        createdAt: 'desc',
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
