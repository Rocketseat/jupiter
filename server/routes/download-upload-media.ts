import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Elysia, t } from 'elysia'

import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'

export const downloadUploadMedia = new Elysia().get(
  '/videos/:videoId/download/:media',
  async ({ params, set }) => {
    const { videoId, media } = params

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    const columnKey = media === 'video' ? 'storageKey' : 'audioStorageKey'

    const downloadKey = video[columnKey]

    if (downloadKey === null) {
      set.status = 400

      return { message: 'Media file not found.' }
    }

    const downloadSignedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
        Key: downloadKey,
      }),
      { expiresIn: 60 * 60 /* 1 hour */ },
    )

    set.headers['Access-Control-Allow-Origin'] = '*'
    set.headers['Access-Control-Allow-Methods'] =
      'GET, POST, PUT, DELETE, OPTIONS'
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

    set.redirect = downloadSignedUrl
  },
  {
    params: t.Object({
      videoId: t.String(),
      media: t.Union([t.Literal('video'), t.Literal('audio')]),
    }),
  },
)
