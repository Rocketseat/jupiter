import { prisma } from '@/lib/prisma'
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
        sizeInBytes: z.number(),
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
    await prisma.uploadBatch.create({
      data: {
        id: batchId,
        videos: {
          createMany: {
            data: files.map((file, index) => {
              return {
                uploadOrder: index + 1,
                title: file.title,
                storageKey: `inputs/${file.id}.mp4`,
                audioStorageKey: `inputs/${file.id}.mp3`,
                sizeInBytes: file.sizeInBytes,
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
