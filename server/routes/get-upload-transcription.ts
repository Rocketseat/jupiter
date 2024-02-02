import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'

export const getUploadTranscription = new Elysia().get(
  '/videos/:videoId/transcription',
  async ({ params, set }) => {
    const { videoId } = params

    const transcription = await db.query.transcription.findFirst({
      where(fields, { eq }) {
        return eq(fields.videoId, videoId)
      },
      with: {
        segments: {
          orderBy(fields, { asc }) {
            return asc(fields.start)
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
