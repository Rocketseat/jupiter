import {
  GetObjectCommand,
  getSignedUrl,
  PutObjectCommand,
  r2,
} from '@nivo/cloudflare'
import { db } from '@nivo/drizzle'
import { env } from '@nivo/env'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const storageRouter = createTRPCRouter({
  requestVideoUploadUrl: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { videoId } = input

      const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_UPLOAD_BUCKET_NAME,
          Key: `${videoId}.mp4`,
          ContentType: 'video/mp4',
        }),
        { expiresIn: 600 },
      )

      return { url: signedUrl }
    }),

  requestAudioUploadUrl: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { videoId } = input

      const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_UPLOAD_BUCKET_NAME,
          Key: `${videoId}.mp3`,
          ContentType: 'audio/mpeg',
        }),
        { expiresIn: 600 },
      )

      return { url: signedUrl }
    }),

  requestMediaDownloadUrl: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        media: z.enum(['video', 'audio']),
      }),
    )
    .query(async ({ input }) => {
      const { videoId, media } = input

      const videoToDownload = await db.query.upload.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, videoId)
        },
      })

      if (!videoToDownload) {
        throw new TRPCError({
          message: 'Video not found.',
          code: 'BAD_REQUEST',
        })
      }

      const columnKey = media === 'video' ? 'storageKey' : 'audioStorageKey'
      const downloadKey = videoToDownload[columnKey]

      if (downloadKey === null) {
        throw new TRPCError({
          message: 'Media not found.',
          code: 'BAD_REQUEST',
        })
      }

      const downloadSignedUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
          Key: downloadKey,
        }),
        { expiresIn: 60 * 60 /* 1 hour */ },
      )

      return { downloadUrl: downloadSignedUrl }
    }),
})
