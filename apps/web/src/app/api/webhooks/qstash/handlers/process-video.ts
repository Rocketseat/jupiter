import { CopyObjectCommand, r2 } from '@nivo/cloudflare'
import { db } from '@nivo/drizzle'
import { upload } from '@nivo/drizzle/schema'
import { env } from '@nivo/env'
import { publishEvent } from '@nivo/qstash'
import { eq } from 'drizzle-orm'

import { WebhookError } from '../errors/webhook-error'

export async function processVideo(videoId: string) {
  const sourceUpload = await db.query.upload.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, videoId)
    },
  })

  if (!sourceUpload) {
    throw new WebhookError('Video not found.')
  }

  if (sourceUpload.processedAt) {
    /**
     * Video already was processed
     */

    return
  }

  const storageKey = `batch-${sourceUpload.uploadBatchId}/${sourceUpload.id}.mp4`
  const audioStorageKey = `batch-${sourceUpload.uploadBatchId}/${sourceUpload.id}.mp3`

  const moveVideoFilePromise = r2.send(
    new CopyObjectCommand({
      Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
      CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${sourceUpload.id}.mp4`,
      Key: storageKey,
    }),
  )

  const moveAudioFilePromise = r2.send(
    new CopyObjectCommand({
      Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
      CopySource: `${env.CLOUDFLARE_UPLOAD_BUCKET_NAME}/${sourceUpload.id}.mp3`,
      Key: audioStorageKey,
    }),
  )

  await Promise.all([moveVideoFilePromise, moveAudioFilePromise])

  await db
    .update(upload)
    .set({ processedAt: new Date(), storageKey, audioStorageKey })
    .where(eq(upload.id, videoId))

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
