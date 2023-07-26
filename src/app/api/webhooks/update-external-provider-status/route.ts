import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

const pandaWebhookBodySchema = z.object({
  action: z.enum(['video.changeStatus']),
  folder_id: z.string().optional().nullable(),
  video_id: z.string().uuid(),
  status: z.enum(['DRAFT', 'CONVERTING', 'CONVERTED', 'FAILED']),
  video_external_id: z.string().uuid(),
})

export async function POST(request: Request) {
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
    return new Response()
  }

  try {
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (!video || video.externalProviderId) {
      /**
       * Here we return a success response as the webhook can be called with
       * videos that were not stored on jupiter or the video could already had
       * been updated.
       */
      return new Response()
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

    return new Response()
  } catch (err) {
    console.log(err)

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
