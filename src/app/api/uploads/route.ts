import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse } from 'next/server'

import { env } from '@/env'
import { r2 } from '@/lib/cloudflare-r2'

export async function POST(request: Request) {
  const { videoId } = await request.json()

  try {
    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_UPLOAD_BUCKET_NAME,
        Key: `${videoId}.mp4`,
        ContentType: 'video/mp4',
      }),
      { expiresIn: 600 },
    )

    return NextResponse.json({ url: signedUrl })
  } catch (err) {
    console.log('error')
  }
}
