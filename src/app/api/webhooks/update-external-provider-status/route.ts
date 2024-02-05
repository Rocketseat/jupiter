import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { db } from '@/drizzle/client'
import { video, webhook } from '@/drizzle/schema'
import { env } from '@/env'
import { publishMessagesOnTopic } from '@/lib/kafka'

const pandaWebhookBodySchema = z.object({
  action: z.enum(['video.changeStatus']),
  folder_id: z.string().optional().nullable(),
  video_id: z.string().uuid(),
  video_external_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const webhookId = randomUUID()

  const {
    video_id: videoId,
    video_external_id: videoExternalId,
    folder_id: folderId,
  } = pandaWebhookBodySchema.parse(await request.json())

  if (!folderId || folderId !== env.PANDAVIDEO_UPLOAD_FOLDER) {
    /**
     * We want to ignore videos that were not uploaded by Jupiter.
     */
    return new NextResponse(null, { status: 204 })
  }

  try {
    const sourceVideo = await db.query.video.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, videoId)
      },
      with: {
        tagToVideos: {
          with: {
            tag: true,
          },
        },
      },
    })

    if (!sourceVideo || sourceVideo.externalProviderId) {
      /**
       * Here we return a success response as the webhook can be called with
       * videos that were not stored on jupiter or the video could already had
       * been updated.
       */
      return new NextResponse(null, { status: 204 })
    }

    await db.transaction(async (tx) => {
      await tx
        .update(video)
        .set({ externalProviderId: videoExternalId })
        .where(eq(video.id, videoId))

      db.insert(webhook).values({
        id: webhookId,
        type: 'UPDATE_EXTERNAL_PROVIDER_STATUS',
        videoId,
        status: 'SUCCESS',
        finishedAt: new Date(),
        metadata: JSON.stringify({
          videoExternalId,
        }),
      })
    })

    await publishMessagesOnTopic({
      topic: 'jupiter.video-updated',
      messages: [
        {
          id: videoId,
          duration: sourceVideo.duration,
          title: sourceVideo.title,
          commitUrl: sourceVideo.commitUrl,
          description: sourceVideo.description,
          externalProviderId: videoExternalId,
          tags: sourceVideo.tagToVideos.map(
            (tagToVideo) => tagToVideo.tag.slug,
          ),
        },
      ],
    })

    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    await db.insert(webhook).values({
      id: webhookId,
      type: 'UPDATE_EXTERNAL_PROVIDER_STATUS',
      videoId,
      status: 'ERROR',
      finishedAt: new Date(),
      metadata: JSON.stringify({
        videoExternalId,
      }),
    })
  }
}
