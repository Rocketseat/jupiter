import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { db } from '@/drizzle/client'
import { BunnyStatus, video, webhook } from '@/drizzle/schema'
import { publishMessagesOnTopic } from '@/lib/kafka'

const bunnyWebhookSchema = z.object({
  VideoLibraryId: z.coerce.string(),
  VideoGuid: z.string().uuid(),
  Status: z
    .union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ])
    .transform((statusNumber) => {
      const statusNumberToString: BunnyStatus[] = [
        'created',
        'uploaded',
        'processing',
        'transcoding',
        'finished',
        'error',
        'failed',
      ] as const

      return statusNumberToString[statusNumber]
    }),
})

export async function POST(request: NextRequest) {
  const webhookId = randomUUID()

  const {
    Status: externalStatus,
    VideoGuid: externalProviderId,
    VideoLibraryId: videoLibraryId,
  } = bunnyWebhookSchema.parse(await request.json())

  const sourceVideo = await db.query.video.findFirst({
    where(fields, { eq }) {
      return eq(fields.externalProviderId, externalProviderId)
    },
    with: {
      tagToVideos: {
        with: {
          tag: true,
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
    /**
     * Here we return a success response as the webhook can be called with
     * videos that were not stored on jupiter or the video could already had
     * been updated.
     */
    return new NextResponse(null, { status: 204 })
  }

  if (sourceVideo.company.externalId !== videoLibraryId) {
    /**
     * Here we return a success response even the video ID not belonging to
     * the right company as we don't want this webhook to retry.
     */
    return new NextResponse(null, { status: 204 })
  }

  if (sourceVideo.externalStatus === 'finished') {
    /**
     * Sometimes Bunny send a late webhook after "finished" status, but we
     * don't want to update the status after the "finished" status occurs.
     */
    return new NextResponse(null, { status: 204 })
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(video)
        .set({ externalStatus })
        .where(eq(video.id, sourceVideo.id))

      await tx.insert(webhook).values({
        id: webhookId,
        type: 'UPDATE_EXTERNAL_PROVIDER_STATUS',
        videoId: sourceVideo.id,
        status: 'SUCCESS',
        finishedAt: new Date(),
        metadata: JSON.stringify({
          externalStatus,
          externalProviderId,
          videoLibraryId,
        }),
      })
    })

    await publishMessagesOnTopic({
      topic: 'jupiter.video-updated',
      messages: [
        {
          id: sourceVideo.id,
          duration: sourceVideo.duration,
          title: sourceVideo.title,
          commitUrl: sourceVideo.commitUrl,
          description: sourceVideo.description,
          externalProviderId: sourceVideo.externalProviderId,
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
      videoId: sourceVideo.id,
      status: 'ERROR',
      finishedAt: new Date(),
      metadata: JSON.stringify({
        externalStatus,
        externalProviderId,
        videoLibraryId,
      }),
    })
  }
}
