import { randomUUID } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/env'
import { publishMessagesOnTopic } from '@/lib/kafka'
import { prisma } from '@/lib/prisma'

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
    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
      include: {
        tags: true,
      },
    })

    if (!video || video.externalProviderId) {
      /**
       * Here we return a success response as the webhook can be called with
       * videos that were not stored on jupiter or the video could already had
       * been updated.
       */
      return new NextResponse(null, { status: 204 })
    }

    await prisma.$transaction([
      prisma.video.update({
        where: {
          id: videoId,
        },
        data: {
          externalProviderId: videoExternalId,
        },
      }),
      prisma.webhook.create({
        data: {
          id: webhookId,
          type: 'UPDATE_EXTERNAL_PROVIDER_STATUS',
          videoId,
          status: 'SUCCESS',
          finishedAt: new Date(),
          metadata: JSON.stringify({
            videoExternalId,
          }),
        },
      }),
    ])

    await publishMessagesOnTopic({
      topic: 'jupiter.video-updated',
      messages: [
        {
          id: videoId,
          duration: video.duration,
          title: video.title,
          commitUrl: video.commitUrl,
          description: video.description,
          externalProviderId: videoExternalId,
          tags: video.tags.map((tag) => tag.slug),
        },
      ],
    })

    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    await prisma.webhook.create({
      data: {
        id: webhookId,
        type: 'UPDATE_EXTERNAL_PROVIDER_STATUS',
        videoId,
        status: 'ERROR',
        finishedAt: new Date(),
        metadata: JSON.stringify({
          videoExternalId,
        }),
      },
    })
  }
}
