import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import FormData from 'form-data'
import axios from 'axios'
import { z } from 'zod'
import { env } from '@/env'

const createTranscriptionBodySchema = z.object({
  videoId: z.string().uuid(),
})

export async function POST(request: Request) {
  const { videoId } = createTranscriptionBodySchema.parse(await request.json())

  try {
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (!video.processedAt) {
      return NextResponse.json(
        { message: "Video hasn't processed yet." },
        {
          status: 400,
        },
      )
    }

    if (video.externalProviderId) {
      return NextResponse.json(
        { message: 'Video has already been uploaded to external provider.' },
        {
          status: 409,
        },
      )
    }

    const videoFile = await r2.send(
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_BUCKET_NAME,
        Key: video.storageKey,
      }),
    )

    if (!videoFile.Body) {
      return
    }

    // const formData = new FormData()

    // formData.append('file', videoFile.Body, {
    //   contentType: videoFile.ContentType,
    //   knownLength: videoFile.ContentLength,
    //   filename: video.audioStorageKey,
    // })

    // formData.append('model', 'whisper-1')
    // formData.append('response_format', 'json')
    // formData.append('temperature', '0')
    // formData.append('language', 'pt')

    const response = await axios.post(
      'https://uploader-us01.pandavideo.com.br/files',
      videoFile.Body,
      {
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Length': videoFile.ContentLength,
          'Content-Type': 'application/offset+octet-stream',
          'Upload-Metadata': `authorization ${btoa(
            env.PANDAVIDEO_API_KEY,
          )}, filename ${btoa(video.id)}, video_id ${btoa(
            video.id,
          )}, folder_id ${btoa('6cf7cc26-f9fc-4e5f-b332-54935d430ab3')}`,
        },
      },
    )

    return NextResponse.json({ data: response.data })
  } catch (err) {
    console.log(err)
  }
}
