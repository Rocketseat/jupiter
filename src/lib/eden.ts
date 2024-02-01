import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@server/app'

import { env } from '@/env'

export const { api } = edenTreaty<App>(env.NEXT_PUBLIC_VERCEL_URL)
