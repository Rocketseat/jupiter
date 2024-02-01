import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@server/app'
import { headers } from 'next/headers'

import { env } from '@/env'

export const { api: server } = edenTreaty<App>(env.NEXT_PUBLIC_VERCEL_URL, {
  $fetch: {
    headers: Object.fromEntries(headers().entries()),
  },
})
