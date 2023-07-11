import { createFFmpeg } from '@ffmpeg/ffmpeg'

export const ffmpeg = createFFmpeg({
  log: true,
  corePath: new URL(
    '/ffmpeg-dist/ffmpeg-core.js',
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ).href,
})
