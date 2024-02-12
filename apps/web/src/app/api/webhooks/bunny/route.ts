import { BunnyStatus } from '@nivo/bunny'
import { db } from '@nivo/drizzle'
import { upload, uploadWebhook } from '@nivo/drizzle/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 300
export const preferredRegion = 'cle1'

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

async function handler(request: NextRequest) {
  const requestBody = await request.json()
  const webhookId = crypto.randomUUID()

  const {
    Status: externalStatus,
    VideoGuid: externalProviderId,
    VideoLibraryId: videoLibraryId,
  } = bunnyWebhookSchema.parse(requestBody)

  const sourceVideo = await db.query.upload.findFirst({
    where(fields, { eq }) {
      return eq(fields.externalProviderId, externalProviderId)
    },
    with: {
      tagToUploads: {
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
        .update(upload)
        .set({ externalStatus })
        .where(eq(upload.id, sourceVideo.id))

      await tx.insert(uploadWebhook).values({
        id: webhookId,
        type: 'UPDATE_EXTERNAL_PROVIDER_STATUS',
        uploadId: sourceVideo.id,
        status: 'SUCCESS',
        finishedAt: new Date(),
      })
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    await db.insert(uploadWebhook).values({
      id: webhookId,
      type: 'UPDATE_EXTERNAL_PROVIDER_STATUS',
      uploadId: sourceVideo.id,
      status: 'ERROR',
      finishedAt: new Date(),
      metadata: err instanceof Error ? JSON.stringify(err) : null,
    })

    return NextResponse.json(
      { message: `Unexpected error (Webhook ID: "${webhookId}")` },
      { status: 500 },
    )
  }
}

export const POST = handler
