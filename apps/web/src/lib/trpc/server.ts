import 'server-only'

import { auth } from '@nivo/auth'
import { appRouter, createCallerFactory } from '@nivo/trpc'

export const serverClient = createCallerFactory(appRouter)(async () => {
  const session = await auth()

  return { session }
})
