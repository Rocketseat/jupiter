import { randomUUID } from 'node:crypto'

import { GetObjectCommand } from '@aws-sdk/client-s3'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import axios from 'axios'
import FormData from 'form-data'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { publishMessage } from '@/lib/qstash'
import { publishMessagesOnTopic } from '@/lib/kafka'

const createTranscriptionBodySchema = z.object({
  videoId: z.string().uuid(),
})

interface OpenAITranscriptionResponse {
  text: string
  segments: Array<{
    start: number
    end: number
    text: string
  }>
}

export const maxDuration = 300

async function handler(request: NextRequest) {
  const webhookId = randomUUID()

  const body = await request.json()

  try {
    const { videoId } = createTranscriptionBodySchema.parse(body)

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
        metadata: JSON.stringify(body),
      },
    })

    const audioFile = await r2.send(
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        Key: video.audioStorageKey,
      }),
    )

    if (!audioFile.Body) {
      return NextResponse.json(
        { message: 'Audio file not found.' },
        { status: 400 },
      )
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
    formData.append('language', video.language)

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

 
    await Promise.all([
      publishMessage({
        topic: 'jupiter.transcription-created',
        body: {
          videoId,
          title: video.title,
          transcription: response.data.text,
          segments: response.data.segments,
        },
        options: {
          delay: 10,
        },
      }),

      publishMessagesOnTopic({
        topic: 'jupiter.transcription-created',
        messages: [
          {
            videoId,
            title: video.title,
            transcription: response.data.text,
            segments: response.data.segments,
          },
        ],
      }),
    ])

    return new NextResponse(null, { status: 201 })
  } catch (err: unknown) {
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
      { message: 'Error processing video.', error: err },
      { status: 400 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
