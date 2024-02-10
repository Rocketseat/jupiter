import { AppRouter } from '@nivo/trpc'
import { createTRPCClient, httpBatchLink, TRPCLink } from '@trpc/client'
import SuperJSON from 'superjson'

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function getUrl() {
  return getBaseUrl() + '/api/trpc'
}

export const trpcLinks: TRPCLink<AppRouter>[] = [
  httpBatchLink({
    url: getUrl(),
    transformer: SuperJSON,
  }),
]

export const nativeClient = createTRPCClient<AppRouter>({
  links: trpcLinks,
})
