import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pandaWebhookBodySchema = z.object({
  action: z.enum(['video.changeStatus']),
  video_id: z.string().uuid(),
  status: z.enum(['DRAFT', 'CONVERTING', 'CONVERTED', 'FAILED']),
  video_external_id: z.string().uuid(),
})

export async function POST(request: Request) {
  const { video_id: videoId, video_external_id: videoExternalId } =
    pandaWebhookBodySchema.parse(await request.json())

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

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        externalProviderId: videoExternalId,
      },
    })

    return new Response()
  } catch (err) {
    console.log(err)
  }
}
