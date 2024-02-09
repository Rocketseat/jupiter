import { PutObjectCommand, r2 } from '@nivo/cloudflare'
import { db } from '@nivo/drizzle'
import { video } from '@nivo/drizzle/schema'
import { env } from '@nivo/env'
import { BunnyCdnStream } from 'bunnycdn-stream'
import { eq } from 'drizzle-orm'
import { compile, Cue } from 'node-webvtt'

import { encodeBase64 } from '@/utils/encode-base64'

import { WebhookError } from '../errors/webhook-error'

export async function createSubtitlesFromTranscription(videoId: string) {
  const sourceVideo = await db.query.video.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, videoId)
    },
    with: {
      transcription: {
        with: {
          segments: {
            orderBy(fields, { asc }) {
              return asc(fields.start)
            },
          },
        },
      },
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

  if (!sourceVideo.externalProviderId) {
    throw new WebhookError('Video was not uploaded to external provider yet.')
  }

  if (!sourceVideo.transcription) {
    throw new WebhookError('Video transcription was not generated.')
  }

  if (!sourceVideo.company.externalId) {
    throw new WebhookError('Company has no external ID created.')
  }

  if (sourceVideo.subtitlesStorageKey) {
    /**
     * Subtitles has already been generated
     */

    return
  }

  const subtitlesStorageKey = `batch-${sourceVideo.uploadBatchId}/${videoId}.vtt`

  const segments: Cue[] = sourceVideo.transcription.segments
    .map((segment) => {
      return {
        start: Number(segment.start),
        end: Number(segment.end),
        text: segment.text,
        identifier: '',
        styles: '',
      }
    })
    /**
     * Filter cues where "end" and "start" time are equal
     */
    .filter((cue) => {
      return cue.end > cue.start
    })

  const vtt = compile({
    cues: segments,
    valid: true,
    strict: true,
    errors: [],
  })

  const bunny = new BunnyCdnStream({
    apiKey: env.BUNNY_API_KEY,
    videoLibrary: sourceVideo.company.externalId,
  })

  await Promise.all([
    r2.send(
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        Key: subtitlesStorageKey,
        Body: vtt,
        ContentType: 'text/vtt',
      }),
    ),
    bunny.addCaptions(sourceVideo.externalProviderId, {
      srclang: sourceVideo.language,
      label: sourceVideo.language,
      captionsFile: encodeBase64(vtt),
    }),
  ])

  await db
    .update(video)
    .set({ subtitlesStorageKey })
    .where(eq(video.id, videoId))
}
