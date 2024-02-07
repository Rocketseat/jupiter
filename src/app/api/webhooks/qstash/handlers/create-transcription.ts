import { GetObjectCommand } from '@aws-sdk/client-s3'
import axios from 'axios'
import FormData from 'form-data'

import { db } from '@/drizzle/client'
import { transcription, transcriptionSegment } from '@/drizzle/schema'
import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { publishEvent } from '@/lib/qstash'

import { WebhookError } from '../errors/webhook-error'

interface OpenAITranscriptionResponse {
  text: string
  segments: Array<{
    start: number
    end: number
    text: string
  }>
}

export async function createTranscription(videoId: string) {
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
    throw new WebhookError('Video not found.')
  }

  if (!sourceVideo.processedAt) {
    throw new WebhookError("Video hasn't processed yet.")
  }

  if (!sourceVideo.audioStorageKey) {
    throw new WebhookError('No audio media was found.')
  }

  if (sourceVideo.transcription) {
    /**
     * Transcription was already generated
     */

    return
  }

  const audioFile = await r2.send(
    new GetObjectCommand({
      Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
      Key: sourceVideo.audioStorageKey,
    }),
  )

  if (!audioFile.Body) {
    throw new WebhookError('Audio file was not found on storage.')
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
  })

  await publishEvent({
    event: 'CREATE_SUBTITLES_FROM_TRANSCRIPTION',
    payload: { videoId },
    delayInSeconds: 10,
  })
}
