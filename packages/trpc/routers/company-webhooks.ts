import { db } from '@nivo/drizzle'
import { companyWebhook, webhookEventTrigger } from '@nivo/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const companyWebhooksRouter = createTRPCRouter({
  getAvailableTriggers: protectedProcedure.query(async () => {
    const triggers = [
      {
        trigger: 'upload.created',
        description: 'Occurs whenever a video is uploaded.',
      },
      {
        trigger: 'upload.transcription.created',
        description: 'Occurs whenever a transcription is generated.',
      },
      {
        trigger: 'upload.updated',
        description: 'Occurs whenever a video is updated.',
      },
      {
        trigger: 'upload.deleted',
        description: 'Occurs whenever a video is deleted.',
      },
      {
        trigger: 'tag.created',
        description: 'Occurs whenever a tag is created.',
      },
      {
        trigger: 'tag.deleted',
        description: 'Occurs whenever a tag is deleted.',
      },
    ] as const

    return { triggers }
  }),

  getCompanyWebhooks: protectedProcedure.query(async ({ ctx }) => {
    const { companyId } = ctx.session.user

    const companyWebhooks = await db.query.companyWebhook.findMany({
      where(fields, { eq }) {
        return eq(fields.companyId, companyId)
      },
    })

    return { companyWebhooks }
  }),

  createCompanyWebhook: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        triggers: z.array(webhookEventTrigger),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId } = ctx.session.user
      const { url, triggers } = input

      await db.insert(companyWebhook).values({
        companyId,
        url,
        triggers,
      })
    }),

  deleteCompanyWebhook: protectedProcedure
    .input(
      z.object({
        companyWebhookId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId } = ctx.session.user
      const { companyWebhookId } = input

      await db
        .delete(companyWebhook)
        .where(
          and(
            eq(companyWebhook.companyId, companyId),
            eq(companyWebhook.id, companyWebhookId),
          ),
        )
    }),
})
