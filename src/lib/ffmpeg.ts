import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

import { env } from '@/env'

export const ffmpeg = createFFmpeg({
  log: env.NODE_ENV === 'development',
  corePath: new URL('/ffmpeg-dist/ffmpeg-core.js', env.NEXT_PUBLIC_VERCEL_URL)
    .href,
})

export async function convertVideoToMP3(
  inputFile: File,
  onProgress: (progress: number) => void,
): Promise<File> {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load()
  }

  ffmpeg.FS('writeFile', inputFile.name, await fetchFile(inputFile))

  ffmpeg.setProgress(({ ratio }) => {
    const progress = Math.round(ratio * 100)

    onProgress(progress)
  })

  const outputId = crypto.randomUUID()

  await ffmpeg.run(
    '-i',
    inputFile.name,
    '-vn',
    '-b:a',
    '20k',
    '-acodec',
    'libmp3lame',
    `${outputId}.mp3`,
  )

  const data = ffmpeg.FS('readFile', `${outputId}.mp3`)

  const audioFileBlob = new Blob([data.buffer], { type: 'audio/mpeg' })

  const audioFile = new File([audioFileBlob], `${outputId}.mp3`, {
    type: 'audio/mpeg',
  })

  return audioFile
}
