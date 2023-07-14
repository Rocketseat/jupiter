import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import axios from 'axios'
import { z } from 'zod'
import { env } from '@/env'
import { validateQStashSignature } from '@/lib/qstash'

const createTranscriptionBodySchema = z.object({
  videoId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const { bodyAsJSON } = await validateQStashSignature({ request })

    const { videoId } = createTranscriptionBodySchema.parse(bodyAsJSON)

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
  } catch (err: any) {
    console.error(err)

    return NextResponse.json(
      { message: 'Error uploading video.', error: err?.message || '' },
      { status: 401 },
    )
  }
}
