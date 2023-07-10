import { r2 } from '@/lib/cloudflare-r2'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import FormData from 'form-data'
import axios from 'axios'

interface GenerateVideoTranscriptionParams {
  params: {
    id: string
  }
}

export async function GET(
  _: Request,
  { params }: GenerateVideoTranscriptionParams,
) {
  const videoId = params.id

  try {
    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    })

    const videoFile = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: video.storageKey,
      }),
    )

    if (!videoFile.Body) {
      return
    }

    const formData = new FormData()

    formData.append('file', videoFile.Body, {
      contentType: videoFile.ContentType,
      knownLength: videoFile.ContentLength,
      filename: video.storageKey,
    })

    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')
    formData.append('temperature', '0')
    formData.append('language', 'pt')

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      },
    )

    return NextResponse.json({ transcription: response.data })
  } catch (err) {
    console.log(err)
  }
}
