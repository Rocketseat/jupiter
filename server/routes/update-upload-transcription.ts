import { Elysia, t } from 'elysia'

import { prisma } from '@/lib/prisma'

export const updateUploadTranscription = new Elysia().put(
  '/transcriptions',
  async ({ body, set }) => {
    const { segments } = body

    await prisma.$transaction(
      segments.map((segment) => {
        return prisma.transcriptionSegment.update({
          where: {
            id: segment.id,
          },
          data: {
            text: segment.text,
          },
        })
      }),
    )

    return new Response(null, { status: 204 })
  },
  {
    body: t.Object({
      segments: t.Array(
        t.Object({
          id: t.String(),
          text: t.String(),
        }),
        { minItems: 1 },
      ),
    }),
  },
)
