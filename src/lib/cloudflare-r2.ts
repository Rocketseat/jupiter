import { S3Client } from '@aws-sdk/client-s3'

const endpoint = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const r2 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY || '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_KEY || '',
  },
})

export function buildStorageURL(key: string) {
  const bucket = process.env.CLOUDFLARE_BUCKET_NAME
  const url = new URL(`${bucket}/${key}`, endpoint)

  return url.toString()
}
