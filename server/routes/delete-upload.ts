import { DeleteObjectsCommand, ObjectIdentifier } from '@aws-sdk/client-s3'
import axios from 'axios'
import { eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { video } from '@/drizzle/schema'
import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { publishMessagesOnTopic } from '@/lib/kafka'

export const deleteUpload = new Elysia().delete(
  '/videos/:videoId',
  async ({ params }) => {
    const { videoId } = params

    const videoToDelete = await db.query.video.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, videoId)
      },
    })

    if (!videoToDelete) {
      throw new Error('Video not found.')
    }

    const objectsToDelete: ObjectIdentifier[] = []
    const deletionPromises: Promise<unknown>[] = []

    if (videoToDelete.storageKey) {
      objectsToDelete.push({
        Key: videoToDelete.storageKey,
      })
    }

    if (videoToDelete.audioStorageKey) {
      objectsToDelete.push({
        Key: videoToDelete.audioStorageKey,
      })
    }

    if (videoToDelete.subtitlesStorageKey) {
      objectsToDelete.push({
        Key: videoToDelete.subtitlesStorageKey,
      })
    }

    if (objectsToDelete.length > 0) {
      deletionPromises.push(
        r2.send(
          new DeleteObjectsCommand({
            Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
            Delete: {
              Objects: objectsToDelete,
              Quiet: true,
            },
          }),
        ),
      )
    }

    if (videoToDelete.externalProviderId) {
      /**
       * TODO: delete video on bunny
       */
      // deletionPromises.push(
      //   axios.delete('https://api-v2.pandavideo.com.br/videos', {
      //     data: [{ video_id: videoId }],
      //     headers: {
      //       Authorization: env.PANDAVIDEO_API_KEY,
      //     },
      //   }),
      // )
    }

    deletionPromises.push(db.delete(video).where(eq(video.id, videoId)))

    await Promise.all(deletionPromises)

    await Promise.all([
      // QStash
      // publishMessage({
      //   topic: 'jupiter.video-deleted',
      //   body: {
      //     videoId,
      //   },
      // }),

      // Kafka
      publishMessagesOnTopic({
        topic: 'jupiter.video-deleted',
        messages: [
          {
            id: videoId,
          },
        ],
      }),
    ])

    return new Response(null, { status: 204 })
  },
  {
    params: t.Object({
      videoId: t.String(),
    }),
  },
)
