import { buildStorageURL } from '@/lib/cloudflare-r2'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface GetBatchParams {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: GetBatchParams) {
  const batchId = params.id

  try {
    const batch = await prisma.uploadBatch.findUniqueOrThrow({
      where: {
        id: batchId,
      },
      include: {
        videos: true,
      },
    })

    return NextResponse.json({
      batch: {
        ...batch,
        videos: batch.videos.map((video) => {
          return {
            ...video,
            storageURL: buildStorageURL(video.storageKey),
          }
        }),
      },
    })
  } catch (err) {
    console.log(err)
  }
}
