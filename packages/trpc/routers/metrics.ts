import { dayjs } from '@nivo/dayjs'
import { db } from '@nivo/drizzle'
import { video } from '@nivo/drizzle/schema'
import { and, count, eq, gte, sum } from 'drizzle-orm'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const metricsRouter = createTRPCRouter({
  storageSummary: protectedProcedure.query(async ({ ctx }) => {
    const { companyId } = ctx.session.user

    const [[{ storageOverall }], [{ storageLastMonth }]] = await Promise.all([
      db
        .select({
          storageOverall: sum(video.sizeInBytes).mapWith(Number),
        })
        .from(video)
        .where(eq(video.companyId, companyId)),

      db
        .select({
          storageLastMonth: sum(video.sizeInBytes).mapWith(Number),
        })
        .from(video)
        .where(
          and(
            gte(video.createdAt, dayjs().subtract(30, 'days').toDate()),
            eq(video.companyId, companyId),
          ),
        ),
    ])

    return { storageOverall, storageLastMonth }
  }),

  uploadsAmountSummary: protectedProcedure.query(async ({ ctx }) => {
    const { companyId } = ctx.session.user

    const [[{ amountOverall }], [{ amountLastMonth }]] = await Promise.all([
      db
        .select({ amountOverall: count().mapWith(Number) })
        .from(video)
        .where(eq(video.companyId, companyId)),

      db
        .select({
          amountLastMonth: count().mapWith(Number),
        })
        .from(video)
        .where(
          and(
            gte(video.createdAt, dayjs().subtract(30, 'days').toDate()),
            eq(video.companyId, companyId),
          ),
        ),
    ])

    return {
      amountOverall,
      amountLastMonth,
    }
  }),
})
