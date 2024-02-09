import { metricsRouter } from './routers/metrics'
import { profileRouter } from './routers/profile'
import { storageRouter } from './routers/storage'
import { tagsRouter } from './routers/tags'
import { transcriptionsRouter } from './routers/transcriptions'
import { uploadsBatchesRouter } from './routers/upload-batches'
import { uploadWebhooksRouter } from './routers/upload-webhooks'
import { uploadsRouter } from './routers/uploads'
import { createCallerFactory, mergeRouters } from './trpc'

export const appRouter = mergeRouters(
  profileRouter,
  storageRouter,
  tagsRouter,
  transcriptionsRouter,
  uploadsBatchesRouter,
  uploadWebhooksRouter,
  uploadsRouter,
  metricsRouter,
)

export { createCallerFactory }

export type AppRouter = typeof appRouter
