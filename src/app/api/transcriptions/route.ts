import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const updateTranscriptionSegmentsBodySchema = z.object({
  segments: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
})

export async function PUT(request: Request) {
  const { segments } = updateTranscriptionSegmentsBodySchema.parse(
    await request.json(),
  )

  try {
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

    return new Response()
  } catch (err) {
    console.log(err)
  }
}
