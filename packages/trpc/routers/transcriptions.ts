import { db } from '@nivo/drizzle'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const transcriptionsRouter = createTRPCRouter({
  getUploadTranscription: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { videoId } = input

      const transcription = await db.query.transcription.findFirst({
        where(fields, { eq }) {
          return eq(fields.uploadId, videoId)
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
        throw new TRPCError({
          message: 'Transcription was not generated yet',
          code: 'BAD_REQUEST',
        })
      }

      return { transcription }
    }),
})
