import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import FormData from 'form-data'
import axios from 'axios'
import { z } from 'zod'
import { env } from '@/env'
import { publishMessage, validateQStashSignature } from '@/lib/qstash'
import { randomUUID } from 'node:crypto'

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
  const webhookId = randomUUID()

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

    if (!video.audioStorageKey) {
      return NextResponse.json(
        { message: 'No audio media found.' },
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

    await prisma.webhook.create({
      data: {
        id: webhookId,
        type: 'CREATE_TRANSCRIPTION',
        videoId,
        metadata: JSON.stringify(bodyAsJSON),
      },
    })

    const audioFile = await r2.send(
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
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

    await prisma.$transaction([
      prisma.transcription.create({
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
      }),
      prisma.webhook.update({
        where: {
          id: webhookId,
        },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
        },
      }),
    ])

    await publishMessage({
      topic: 'jupiter.transcription-created',
      body: {
        videoId,
      },
      options: {
        delay: 10,
      },
    })

    return new Response()
  } catch (err: any) {
    console.error(err)

    await prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        status: 'ERROR',
        finishedAt: new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Error processing video.', error: err?.message || '' },
      { status: 401 },
    )
  }
}
