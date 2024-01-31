import { Elysia, t } from 'elysia'

import { prisma } from '@/lib/prisma'

export const getUploadTranscription = new Elysia().get(
  '/videos/:videoId/transcription',
  async ({ params, set }) => {
    const { videoId } = params

    const transcription = await prisma.transcription.findUnique({
      where: {
        videoId,
      },
      include: {
        segments: {
          orderBy: {
            start: 'asc',
          },
        },
      },
    })

    if (!transcription) {
      set.status = 400

      return { message: 'Transcription was not generated yet.' }
    }

    return { transcription }
  },
  {
    params: t.Object({
      videoId: t.String(),
    }),
  },
)
