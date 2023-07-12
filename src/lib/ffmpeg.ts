import { env } from '@/env'
import { createFFmpeg } from '@ffmpeg/ffmpeg'

export const ffmpeg = createFFmpeg({
  log: env.NODE_ENV === 'development',
  corePath: new URL(
    '/ffmpeg-dist/ffmpeg-core.js',
    env.NEXT_PUBLIC_VERCEL_URL,
  ).href,
})
