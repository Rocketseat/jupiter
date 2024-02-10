import { env } from '@nivo/env'
import { z } from 'zod'

import { qstash } from './client'

export type * from '@upstash/qstash'
export { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'

export const qStashEventSchema = z.enum([
  'PROCESS_VIDEO',
  'UPLOAD_TO_EXTERNAL_PROVIDER',
  'CREATE_TRANSCRIPTION',
  'CREATE_SUBTITLES_FROM_TRANSCRIPTION',
])

export const qStashPayloadSchema = z.object({
  videoId: z.string().uuid(),
})

export type QStashEvent = z.infer<typeof qStashEventSchema>
export type QStashPayload = z.infer<typeof qStashPayloadSchema>

export async function publishEvent({
  event,
  payload,
  delayInSeconds = 0,
}: {
  event: QStashEvent
  payload: QStashPayload
  delayInSeconds?: number
}) {
  if (env.NODE_ENV === 'development' && env.QSTASH_PUBLISH_MESSAGES === false) {
    console.log(
      `[Skipped] [QStash] Event: "${event}": ${JSON.stringify(payload)}"`,
    )

    return
  }

  await qstash.publishJSON({
    topic: env.QSTASH_INTERNAL_TOPIC,
    contentBasedDeduplication: true,
    body: {
      event,
      payload,
    },
    delay: delayInSeconds,
  })
}
