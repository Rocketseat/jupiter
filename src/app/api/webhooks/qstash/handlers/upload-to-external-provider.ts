import axios from 'axios'
import { BunnyCdnStream } from 'bunnycdn-stream'
import { eq } from 'drizzle-orm'

import { db } from '@/drizzle/client'
import { video } from '@/drizzle/schema'
import { env } from '@/env'

import { WebhookError } from '../errors/webhook-error'

export async function uploadToExternalProvider(videoId: string) {
  const sourceVideo = await db.query.video.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, videoId)
    },
    with: {
      company: {
        columns: {
          externalId: true,
        },
      },
    },
  })

  if (!sourceVideo) {
    throw new WebhookError('Video not found.')
  }

  if (!sourceVideo.processedAt || !sourceVideo.storageKey) {
    throw new WebhookError("Video hasn't processed yet.")
  }

  if (!sourceVideo.company.externalId) {
    throw new WebhookError('Company has no external ID.')
  }

  if (sourceVideo.externalProviderId) {
    /**
     * Video was already uploaded to external provider
     */

    return
  }

  const bunny = new BunnyCdnStream({
    apiKey: env.BUNNY_API_KEY,
    videoLibrary: sourceVideo.company.externalId,
  })

  const videoDownloadURL = `https://pub-${env.CLOUDFLARE_UPLOAD_BUCKET_ID}.r2.dev/${videoId}.mp4`

  const { data } = await axios.get(videoDownloadURL, {
    responseType: 'stream',
  })

  const { guid: externalProviderId } = await bunny.createAndUploadVideo(data, {
    title: sourceVideo.title,
  })

  await db
    .update(video)
    .set({ externalProviderId })
    .where(eq(video.id, videoId))
}
