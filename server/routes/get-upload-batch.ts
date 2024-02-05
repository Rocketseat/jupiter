import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'

export const getUploadBatch = new Elysia().get(
  '/batches/:batchId',
  async ({ params }) => {
    const { batchId } = params

    const batch = await db.query.uploadBatch.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, batchId)
      },
      with: {
        videos: {
          with: {
            transcription: {
              columns: {
                id: true,
              },
            },
            author: {
              columns: {
                name: true,
                image: true,
              },
            },
          },
          orderBy(fields, { asc }) {
            return asc(fields.uploadOrder)
          },
        },
      },
    })

    if (!batch) {
      throw new Error('Batch not found.')
    }

    return { batch }
  },
  {
    params: t.Object({
      batchId: t.String(),
    }),
  },
)
