import { FFmpeg } from '@ffmpeg/ffmpeg'
import { ProgressEventCallback } from '@ffmpeg/ffmpeg/dist/esm/types'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export let ffmpeg: FFmpeg | null = null

export async function convertVideoToMP3(
  inputFile: File,
  onProgress: (progress: number) => void,
): Promise<File> {
  ffmpeg = new FFmpeg()

  if (!ffmpeg.loaded) {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    })
  }

  ffmpeg.writeFile(inputFile.name, await fetchFile(inputFile))

  const onFFMpegProgress: ProgressEventCallback = ({ progress }) => {
    const progressPercentage = Math.round(progress * 100)

    onProgress(progressPercentage)
  }

  ffmpeg.on('progress', onFFMpegProgress)

  const outputId = crypto.randomUUID()

  await ffmpeg.exec([
    '-i',
    inputFile.name,
    '-vn',
    '-b:a',
    '20k',
    '-acodec',
    'libmp3lame',
    `${outputId}.mp3`,
  ])

  const data = (await ffmpeg.readFile(`${outputId}.mp3`)) as Uint8Array

  const audioFileBlob = new Blob([data.buffer], { type: 'audio/mpeg' })

  const audioFile = new File([audioFileBlob], `${outputId}.mp3`, {
    type: 'audio/mpeg',
  })

  ffmpeg.off('progress', onFFMpegProgress)

  return audioFile
}
