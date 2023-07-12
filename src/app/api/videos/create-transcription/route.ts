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
      include: {
        transcription: {
          select: {
            id: true,
          },
        },
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

    if (video.transcription) {
      return NextResponse.json(
        { message: 'Video transcription has already been generated.' },
        {
          status: 409,
        },
      )
    }

    const audioFile = await r2.send(
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_BUCKET_NAME,
        Key: video.audioStorageKey,
      }),
    )

    if (!audioFile.Body) {
      return
    }

    const formData = new FormData()

    formData.append('file', audioFile.Body, {
      contentType: audioFile.ContentType,
      knownLength: audioFile.ContentLength,
      filename: video.audioStorageKey,
    })

    formData.append('model', 'whisper-1')
    formData.append('response_format', 'json')
    formData.append('temperature', '0')
    formData.append('language', 'pt')

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      },
    )

    await prisma.transcription.create({
      data: {
        videoId,
        text: response.data.text,
      },
    })

    return new Response()
  } catch (err) {
    console.log(err)
  }
}
