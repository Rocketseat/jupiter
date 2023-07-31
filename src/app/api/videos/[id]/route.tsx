import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { publishMessagesOnTopic } from '@/lib/kafka'
import { prisma } from '@/lib/prisma'
import {
  DeleteObjectsCommand,
  DeleteObjectsRequest,
  ObjectIdentifier,
} from '@aws-sdk/client-s3'
import axios from 'axios'
import { z } from 'zod'

interface VideoParams {
  params: {
    id: string
  }
}

const updateVideoBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  tags: z.array(z.string()).min(1),
  commitUrl: z.string().url().nullable(),
})

export async function PUT(request: Request, { params }: VideoParams) {
  const videoId = params.id
  const requestBody = await request.json()

  const { title, description, commitUrl, tags } =
    updateVideoBodySchema.parse(requestBody)

  try {
    const { duration, externalProviderId } = await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        title,
        description,
        commitUrl,
        tags: {
          connect: tags.map((tag) => {
            return {
              slug: tag,
            }
          }),
        },
      },
    })

    await publishMessagesOnTopic({
      topic: 'jupiter.video-updated',
      messages: [
        {
          id: videoId,
          duration,
          title,
          commitUrl,
          description,
          externalProviderId,
          tags,
        },
      ],
    })

    return new Response()
  } catch (err) {
    console.log(err)
  }
}

export async function DELETE(_: Request, { params }: VideoParams) {
  const videoId = params.id

  try {
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

    await publishMessagesOnTopic({
      topic: 'jupiter.video-deleted',
      messages: [
        {
          id: videoId,
        },
      ],
    })

    return new Response()
  } catch (err) {
    console.log(err)
  }
}
