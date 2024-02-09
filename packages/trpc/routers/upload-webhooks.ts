import { db } from '@nivo/drizzle'
import { upload, uploadWebhook } from '@nivo/drizzle/schema'
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
        .select(getTableColumns(uploadWebhook))
        .from(uploadWebhook)
        .innerJoin(upload, eq(upload.id, uploadWebhook.uploadId))
        .where(
          and(eq(uploadWebhook.uploadId, videoId), eq(upload.companyId, companyId)),
        )
        .orderBy(desc(uploadWebhook.createdAt))

      return { webhooks }
    }),
})
