import { AppRouter } from '@nivo/trpc'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import SuperJSON from 'superjson'

import { trpc } from '.'

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function getUrl() {
  return getBaseUrl() + '/api/trpc'
}

const trpcLinks = [
  httpBatchLink({
    url: getUrl(),
    transformer: SuperJSON,
  }),
]

export const client = createTRPCClient<AppRouter>({
  links: trpcLinks,
})

export const reactClient = trpc.createClient({
  links: trpcLinks,
})
