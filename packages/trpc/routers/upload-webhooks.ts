import { db } from '@nivo/drizzle'
import { video, webhook } from '@nivo/drizzle/schema'
import { and, desc, eq, getTableColumns } from 'drizzle-orm'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const uploadWebhooksRouter = createTRPCRouter({
  getUploadWebhooks: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { companyId } = ctx.session.user
      const { videoId } = input

      const webhooks = await db
        .select(getTableColumns(webhook))
        .from(webhook)
        .innerJoin(video, eq(video.id, webhook.videoId))
        .where(
          and(eq(webhook.videoId, videoId), eq(video.companyId, companyId)),
        )
        .orderBy(desc(webhook.createdAt))

      return { webhooks }
    }),
})
