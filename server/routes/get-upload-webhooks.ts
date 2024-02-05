import { and, desc, eq, getTableColumns } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { video, webhook } from '@/drizzle/schema'

import { authentication } from './authentication'

export const getUploadWebhooks = new Elysia().use(authentication).get(
  '/videos/:videoId/webhooks',
  async ({ params, getCurrentUser }) => {
    const { companyId } = await getCurrentUser()
    const { videoId } = params

    const webhooks = await db
      .select(getTableColumns(webhook))
      .from(webhook)
      .innerJoin(video, eq(video.id, webhook.videoId))
      .where(and(eq(webhook.videoId, videoId), eq(video.companyId, companyId)))
      .orderBy(desc(webhook.createdAt))

    return { webhooks }
  },
  {
    params: t.Object({
      videoId: t.String(),
    }),
  },
)
