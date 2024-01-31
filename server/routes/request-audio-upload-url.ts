import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Elysia, t } from 'elysia'

import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'

export const requestAudioUploadURL = new Elysia().post(
  '/uploads/audio',
  async ({ body }) => {
    const { videoId } = body

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_UPLOAD_BUCKET_NAME,
        Key: `${videoId}.mp3`,
        ContentType: 'audio/mpeg',
      }),
      { expiresIn: 600 },
    )

    return { url: signedUrl }
  },
  {
    body: t.Object({
      videoId: t.String(),
    }),
  },
)
