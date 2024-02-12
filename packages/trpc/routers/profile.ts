import { db } from '@nivo/drizzle'
import { TRPCError } from '@trpc/server'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const profileRouter = createTRPCRouter({
  getCurrentUserCompany: protectedProcedure.query(async ({ ctx }) => {
    const { companyId } = ctx.session.user

    const company = await db.query.company.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, companyId)
      },
      with: {
        members: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!company) {
      throw new TRPCError({
        message: 'Company not found.',
        code: 'BAD_REQUEST',
      })
    }

    return { company }
  }),
})
