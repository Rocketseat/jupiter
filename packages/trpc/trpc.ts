import { Session } from '@nivo/auth'
import { initTRPC, TRPCError } from '@trpc/server'
import SuperJSON from 'superjson'

type TRPCContext = {
  session: Session | null
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON,
})

export const {
  router: createTRPCRouter,
  procedure: publicProcedure,
  createCallerFactory,
  middleware,
  mergeRouters,
} = t

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  })
})
