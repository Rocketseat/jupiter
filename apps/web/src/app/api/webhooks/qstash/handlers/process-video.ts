import { CopyObjectCommand, r2 } from '@nivo/cloudflare'
import { db } from '@nivo/drizzle'
import { video } from '@nivo/drizzle/schema'
import { env } from '@nivo/env'
import { publishEvent } from '@nivo/qstash'
import { eq } from 'drizzle-orm'

import { WebhookError } from '../errors/webhook-error'

export async function processVideo(videoId: string) {
  const sourceVideo = await db.query.video.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, videoId)
    },
  })

  if (!sourceVideo) {
    throw new WebhookError('Video not found.')
  }

  if (sourceVideo.processedAt) {
    /**
     * Video already was processed
     */

    return
  }

  const storageKey = `batch-${sourceVideo.uploadBatchId}/${sourceVideo.id}.mp4`
  const audioStorageKey = `batch-${sourceVideo.uploadBatchId}/${sourceVideo.id}.mp3`

  const moveVideoFilePromise = r2.send(
    new CopyObjectCommand({
      Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
      CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${sourceVideo.id}.mp4`,
      Key: storageKey,
    }),
  )

  const moveAudioFilePromise = r2.send(
    new CopyObjectCommand({
      Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
      CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${sourceVideo.id}.mp3`,
      Key: audioStorageKey,
    }),
  )

  await Promise.all([moveVideoFilePromise, moveAudioFilePromise])

  await db
    .update(video)
    .set({ processedAt: new Date(), storageKey, audioStorageKey })
    .where(eq(video.id, videoId))

  await Promise.all([
    publishEvent({
      event: 'UPLOAD_TO_EXTERNAL_PROVIDER',
      payload: { videoId },
    }),
    publishEvent({
      event: 'CREATE_TRANSCRIPTION',
      payload: { videoId },
    }),
  ])
}
