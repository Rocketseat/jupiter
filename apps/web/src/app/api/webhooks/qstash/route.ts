import { db } from '@nivo/drizzle'
import { uploadWebhook } from '@nivo/drizzle/schema'
import { env } from '@nivo/env'
import {
  qStashEventSchema,
  qStashPayloadSchema,
  verifySignatureAppRouter,
} from '@nivo/qstash'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { WebhookError } from './errors/webhook-error'
import { createSubtitlesFromTranscription } from './handlers/create-subtitles-from-transcription'
import { createTranscription } from './handlers/create-transcription'
import { processVideo } from './handlers/process-video'
import { uploadToExternalProvider } from './handlers/upload-to-external-provider'

export const maxDuration = 300
export const preferredRegion = 'cle1'

export const qstashWebhookSchema = z.object({
  event: qStashEventSchema,
  payload: qStashPayloadSchema,
})

async function handler(request: NextRequest) {
  const requestBody = await request.json()
  const webhookId = crypto.randomUUID()

  const { event, payload } = qstashWebhookSchema.parse(requestBody)
  const { videoId } = payload

  await db.insert(uploadWebhook).values({
    id: webhookId,
    type: event,
    uploadId: videoId,
  })

  try {
    switch (event) {
      case 'PROCESS_VIDEO':
        await processVideo(videoId)
        break
      case 'UPLOAD_TO_EXTERNAL_PROVIDER':
        await uploadToExternalProvider(videoId)
        break
      case 'CREATE_TRANSCRIPTION':
        await createTranscription(videoId)
        break
      case 'CREATE_SUBTITLES_FROM_TRANSCRIPTION':
        await createSubtitlesFromTranscription(videoId)
        break
    }

    await db
      .update(uploadWebhook)
      .set({ status: 'SUCCESS', finishedAt: new Date() })
      .where(eq(uploadWebhook.id, webhookId))

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    await db
      .update(uploadWebhook)
      .set({
        status: 'ERROR',
        finishedAt: new Date(),
        metadata: err instanceof Error ? JSON.stringify(err) : null,
      })
      .where(eq(uploadWebhook.id, webhookId))

    if (err instanceof WebhookError) {
      return NextResponse.json({ message: err.message }, { status: 400 })
    }

    return NextResponse.json(
      { message: `Unexpected error (Webhook ID: "${webhookId}")` },
      { status: 500 },
    )
  }
}

export const POST = env.QSTASH_VALIDATE_SIGNATURE
  ? verifySignatureAppRouter(handler)
  : handler
