import { db } from '@nivo/drizzle'
import { tag } from '@nivo/drizzle/schema'
import { publishWebhookEvents } from '@nivo/webhooks'
import { count, ilike } from 'drizzle-orm'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const tagsRouter = createTRPCRouter({
  getTags: protectedProcedure
    .input(
      z.object({
        q: z.string(),
        pageIndex: z.coerce.number().default(0),
        pageSize: z.coerce.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { companyId } = ctx.session.user
      const { q: search, pageIndex, pageSize } = input

      const [tags, [{ amount }]] = await Promise.all([
        db.query.tag.findMany({
          where(fields, { ilike, eq, and }) {
            return and(
              eq(fields.companyId, companyId),
              search ? ilike(fields.slug, `%${search}%`) : undefined,
            )
          },
          offset: pageIndex * pageSize,
          limit: pageSize,
          orderBy(fields, { desc }) {
            return desc(fields.createdAt)
          },
        }),
        db
          .select({ amount: count() })
          .from(tag)
          .where(search ? ilike(tag.slug, `%${search}%`) : undefined),
      ])

      const pageCount = Math.ceil(amount / pageSize) ?? 0

      return { tags, pageCount }
    }),

  createTag: protectedProcedure
    .input(
      z.object({
        tag: z.string().min(2),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId } = ctx.session.user
      const { tag: slug } = input

      await db.insert(tag).values({
        slug,
        companyId,
      })

      await publishWebhookEvents({
        companyId,
        trigger: 'tag.created',
        events: [{ slug }],
      })
    }),
})
