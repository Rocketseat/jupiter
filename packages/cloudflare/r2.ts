import { S3Client } from '@aws-sdk/client-s3'
import { env } from '@nivo/env'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
    secretAccessKey: env.CLOUDFLARE_SECRET_KEY,
  },
})
