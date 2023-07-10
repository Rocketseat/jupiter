import { r2 } from '@/lib/cloudflare-r2'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

interface DeleteUploadParams {
  params: {
    id: string
  }
}

export async function DELETE(request: Request, { params }: DeleteUploadParams) {
  const videoId = params.id

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: `inputs/${videoId}.mp4`,
      }),
    )

    return new Response()
  } catch (err) {
    console.log('error')
  }
}
