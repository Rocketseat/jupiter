import axios from 'axios'

import { env } from '@/env'

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_VERCEL_URL,
})
