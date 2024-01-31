import { Elysia, t } from 'elysia'

import { prisma } from '@/lib/prisma'

export const getUploadBatch = new Elysia().get(
  '/batches/:batchId',
  async ({ params }) => {
    const { batchId } = params

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

    return { batch }
  },
  {
    params: t.Object({
      batchId: t.String(),
    }),
  },
)
