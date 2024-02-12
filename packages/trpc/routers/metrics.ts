import { dayjs } from '@nivo/dayjs'
import { db } from '@nivo/drizzle'
import { upload } from '@nivo/drizzle/schema'
import { and, count, eq, gte, sum } from 'drizzle-orm'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const metricsRouter = createTRPCRouter({
  storageSummary: protectedProcedure.query(async ({ ctx }) => {
    const { companyId } = ctx.session.user

    const [[{ storageOverall }], [{ storageLastMonth }]] = await Promise.all([
      db
        .select({
          storageOverall: sum(upload.sizeInBytes).mapWith(Number),
        })
        .from(upload)
        .where(eq(upload.companyId, companyId)),

      db
        .select({
          storageLastMonth: sum(upload.sizeInBytes).mapWith(Number),
        })
        .from(upload)
        .where(
          and(
            gte(upload.createdAt, dayjs().subtract(30, 'days').toDate()),
            eq(upload.companyId, companyId),
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
        .from(upload)
        .where(eq(upload.companyId, companyId)),

      db
        .select({
          amountLastMonth: count().mapWith(Number),
        })
        .from(upload)
        .where(
          and(
            gte(upload.createdAt, dayjs().subtract(30, 'days').toDate()),
            eq(upload.companyId, companyId),
          ),
        ),
    ])

    return {
      amountOverall,
      amountLastMonth,
    }
  }),
})
