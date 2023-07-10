import { r2 } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createBatchSchema = z.object({
  files: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        duration: z.number(),
        tags: z.array(z.string()).min(1),
      }),
    )
    .min(0),
})

export async function POST(request: Request) {
  const requestBody = await request.json()
  const { files } = createBatchSchema.parse(requestBody)

  const batchId = randomUUID()

  try {
    const bucket = process.env.CLOUDFLARE_BUCKET_NAME

    const moveFilesPromises = files.map((file) => {
      return r2.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/inputs/${file.id}.mp4`,
          Key: `uploads/batch-${batchId}/${file.id}.mp4`,
        }),
      )
    })

    await Promise.all(moveFilesPromises)

    const deleteOriginalFilesPromises = files.map((file) => {
      return r2.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: `inputs/${file.id}.mp4`,
        }),
      )
    })

    await Promise.all(deleteOriginalFilesPromises)

    await prisma.uploadBatch.create({
      data: {
        id: batchId,
        videos: {
          createMany: {
            data: files.map((file) => {
              return {
                title: file.title,
                storageKey: `uploads/batch-${batchId}/${file.id}.mp4`,
                duration: file.duration,
              }
            }),
          },
        },
      },
    })

    return NextResponse.json({ batchId })
  } catch (err) {
    console.log(err)
  }
}
