import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import FormData from 'form-data'
import axios from 'axios'
import { z } from 'zod'
import { env } from '@/env'
import { validateQStashSignature } from '@/lib/qstash'

const createTranscriptionBodySchema = z.object({
  videoId: z.string().uuid(),
})

interface OpenAITranscriptionResponse {
  segments: Array<{
    start: number
    end: number
    text: string
  }>
}

export async function POST(request: Request) {
  try {
    const { bodyAsJSON } = await validateQStashSignature({ request })

    const { videoId } = createTranscriptionBodySchema.parse(bodyAsJSON)

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
    formData.append('response_format', 'verbose_json')
    formData.append('temperature', '0')
    formData.append('language', 'pt')

    const response = await axios.post<OpenAITranscriptionResponse>(
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
        segments: {
          createMany: {
            data: response.data.segments.map((segment) => {
              return {
                text: segment.text,
                start: segment.start,
                end: segment.end,
              }
            }),
          },
        },
      },
    })

    return new Response()
  } catch (err: any) {
    console.error(err)

    return NextResponse.json(
      { message: 'Error processing video.', error: err?.message || '' },
      { status: 401 },
    )
  }
}
