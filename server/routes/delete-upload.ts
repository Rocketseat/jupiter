import { DeleteObjectsCommand, ObjectIdentifier } from '@aws-sdk/client-s3'
import axios from 'axios'
import { Elysia, t } from 'elysia'

import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { publishMessagesOnTopic } from '@/lib/kafka'
import { prisma } from '@/lib/prisma'
import { publishMessage } from '@/lib/qstash'

export const deleteUpload = new Elysia().delete(
  '/videos/:videoId',
  async ({ params }) => {
    const { videoId } = params

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    const objectsToDelete: ObjectIdentifier[] = []
    const deletionPromises: Promise<unknown>[] = []

    if (video.storageKey) {
      objectsToDelete.push({
        Key: video.storageKey,
      })
    }

    if (video.audioStorageKey) {
      objectsToDelete.push({
        Key: video.audioStorageKey,
      })
    }

    if (video.subtitlesStorageKey) {
      objectsToDelete.push({
        Key: video.subtitlesStorageKey,
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

    if (video.externalProviderId) {
      deletionPromises.push(
        axios.delete('https://api-v2.pandavideo.com.br/videos', {
          data: [{ video_id: videoId }],
          headers: {
            Authorization: env.PANDAVIDEO_API_KEY,
          },
        }),
      )
    }

    deletionPromises.push(
      prisma.video.delete({
        where: {
          id: videoId,
        },
      }),
    )

    await Promise.all(deletionPromises)

    await Promise.all([
      // QStash
      publishMessage({
        topic: 'jupiter.video-deleted',
        body: {
          videoId,
        },
      }),

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
