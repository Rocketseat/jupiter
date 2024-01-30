import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

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
        videos: {
          include: {
            transcription: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            uploadOrder: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ batch })
  } catch (err) {
    console.log(err)
  }
}
