import { randomUUID } from 'node:crypto'

import { GetObjectCommand } from '@aws-sdk/client-s3'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import axios from 'axios'
import { eq } from 'drizzle-orm'
import FormData from 'form-data'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { db } from '@/drizzle/client'
import { transcription, transcriptionSegment, webhook } from '@/drizzle/schema'
import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { publishMessage } from '@/lib/qstash'

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

    const sourceVideo = await db.query.video.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, videoId)
      },
      with: {
        transcription: {
          columns: {
            id: true,
          },
        },
      },
    })

    if (!sourceVideo) {
      return NextResponse.json(
        { message: 'Video not found.' },
        {
          status: 400,
        },
      )
    }

    if (!sourceVideo.processedAt) {
      return NextResponse.json(
        { message: "Video hasn't processed yet." },
        {
          status: 400,
        },
      )
    }

    if (!sourceVideo.audioStorageKey) {
      return NextResponse.json(
        { message: 'No audio media found.' },
        {
          status: 400,
        },
      )
    }

    if (sourceVideo.transcription) {
      return NextResponse.json(
        { message: 'Video transcription has already been generated.' },
        {
          status: 409,
        },
      )
    }

    await db.insert(webhook).values({
      id: webhookId,
      type: 'CREATE_TRANSCRIPTION',
      videoId,
      metadata: JSON.stringify({ videoId }),
    })

    const audioFile = await r2.send(
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        Key: sourceVideo.audioStorageKey,
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
      filename: sourceVideo.audioStorageKey,
    })

    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')
    formData.append('temperature', '0')
    formData.append('language', sourceVideo.language)

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

    await db.transaction(async (tx) => {
      const [{ transcriptionId }] = await tx
        .insert(transcription)
        .values({
          videoId,
        })
        .returning({
          transcriptionId: transcription.id,
        })

      await tx.insert(transcriptionSegment).values(
        response.data.segments.map((segment) => {
          return {
            transcriptionId,
            text: segment.text,
            start: segment.start.toString(),
            end: segment.end.toString(),
          }
        }),
      )

      await tx
        .update(webhook)
        .set({
          status: 'SUCCESS',
          finishedAt: new Date(),
        })
        .where(eq(webhook.id, webhookId))
    })

    await publishMessage({
      topic: 'jupiter.transcription-created',
      body: {
        videoId,
        title: sourceVideo.title,
        transcription: response.data.text,
        segments: response.data.segments,
      },
      options: {
        delay: 10,
      },
    })

    return new NextResponse(null, { status: 201 })
  } catch (err: unknown) {
    await db
      .update(webhook)
      .set({
        status: 'ERROR',
        finishedAt: new Date(),
      })
      .where(eq(webhook.id, webhookId))

    return NextResponse.json(
      { message: 'Error processing video.', error: err },
      { status: 400 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
