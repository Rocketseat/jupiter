import { createFFmpeg } from '@ffmpeg/ffmpeg'

export const ffmpeg = createFFmpeg({
  log: process.env.NODE_ENV === 'development',
  corePath: new URL(
    '/ffmpeg-dist/ffmpeg-core.js',
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ).href,
})
