import { DeleteObjectsCommand, ObjectIdentifier, r2 } from '@nivo/cloudflare'
import { db } from '@nivo/drizzle'
import { tag, tagToVideo, user, video } from '@nivo/drizzle/schema'
import { env } from '@nivo/env'
import { TRPCError } from '@trpc/server'
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
} from 'drizzle-orm'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const uploadsRouter = createTRPCRouter({
  getUpload: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { videoId } = input

      const upload = await db.query.video.findFirst({
        with: {
          tagToVideos: {
            with: {
              tag: {
                columns: {
                  slug: true,
                },
              },
            },
          },
        },
        where(fields, { eq }) {
          return eq(fields.id, videoId)
        },
      })

      if (!upload) {
        throw new TRPCError({
          message: 'Video not found.',
          code: 'BAD_REQUEST',
        })
      }

      const { tagToVideos, ...video } = upload

      return {
        video: {
          ...video,
          tags: tagToVideos.map((tagToVideo) => tagToVideo.tag),
        },
      }
    }),

  getUploads: protectedProcedure
    .input(
      z.object({
        titleFilter: z.string().optional(),
        tagsFilter: z
          .union([z.array(z.string()), z.string()])
          .optional()
          .transform((value) => {
            if (value === undefined || Array.isArray(value)) {
              return value
            }

            return [value]
          }),
        pageIndex: z.coerce.number().default(0),
        pageSize: z.coerce.number().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { companyId } = ctx.session.user
      const { pageIndex, pageSize, titleFilter, tagsFilter } = input

      const videoColumns = getTableColumns(video)

      const [videos, [{ amount }]] = await Promise.all([
        db
          .select({
            ...videoColumns,
            author: {
              name: user.name,
              image: user.image,
            },
          })
          .from(video)
          .leftJoin(tagToVideo, eq(tagToVideo.b, video.id))
          .leftJoin(tag, eq(tag.id, tagToVideo.a))
          .leftJoin(user, eq(video.authorId, user.id))
          .where(
            and(
              eq(video.companyId, companyId),
              tagsFilter ? inArray(tag.slug, tagsFilter) : undefined,
              titleFilter ? ilike(video.title, `%${titleFilter}%`) : undefined,
            ),
          )
          .orderBy(desc(video.createdAt))
          .offset(pageIndex * pageSize)
          .limit(pageSize)
          .groupBy(video.id, user.name, user.image),

        db
          .select({ amount: count() })
          .from(video)
          .leftJoin(tagToVideo, eq(tagToVideo.b, video.id))
          .leftJoin(tag, eq(tag.id, tagToVideo.a))
          .where(
            and(
              tagsFilter
                ? inArray(
                    tag.slug,
                    Array.isArray(tagsFilter) ? tagsFilter : [tagsFilter],
                  )
                : undefined,
              titleFilter ? ilike(video.title, `%${titleFilter}%`) : undefined,
            ),
          ),
      ])

      const pageCount = Math.ceil(amount / pageSize)

      return { videos, pageCount }
    }),

  updateUpload: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().nullable(),
        tags: z.array(z.string()).min(1),
        commitUrl: z.string().url().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId } = ctx.session.user
      const { videoId, title, description, tags, commitUrl } = input

      const videoFromCompany = await db.query.video.findFirst({
        where(fields, { eq, and }) {
          return and(eq(fields.id, videoId), eq(fields.companyId, companyId))
        },
      })

      if (!videoFromCompany) {
        throw new TRPCError({
          message: 'Video not found.',
          code: 'BAD_REQUEST',
        })
      }

      const currentVideoTags = await db
        .select({ id: tag.id, slug: tag.slug })
        .from(tag)
        .innerJoin(tagToVideo, eq(tagToVideo.a, tag.id))
        .innerJoin(video, eq(tagToVideo.b, video.id))
        .where(eq(video.id, videoId))

      const currentVideoTagsSlugs = currentVideoTags.map((item) => item.slug)

      const tagsToRemoveIds = currentVideoTags
        .filter((item) => !tags.includes(item.slug))
        .map((item) => item.id)

      const tagsSlugsToAdd = tags.filter((slug) => {
        return !currentVideoTagsSlugs.includes(slug)
      })

      await db.transaction(async (tx) => {
        const [{ duration, externalProviderId }] = await tx
          .update(video)
          .set({
            title,
            description,
            commitUrl,
          })
          .where(eq(video.id, videoId))
          .returning({
            duration: video.duration,
            externalProviderId: video.externalProviderId,
          })

        if (tagsToRemoveIds.length > 0) {
          await tx
            .delete(tagToVideo)
            .where(
              and(
                eq(tagToVideo.b, videoId),
                inArray(tagToVideo.a, tagsToRemoveIds),
              ),
            )
        }

        if (tagsSlugsToAdd.length > 0) {
          const tagsToAdd = await tx.query.tag.findMany({
            columns: {
              id: true,
            },
            where(fields, { inArray }) {
              return inArray(fields.slug, tagsSlugsToAdd)
            },
          })

          const tagsToAddIds = tagsToAdd.map((item) => item.id)

          await tx.insert(tagToVideo).values(
            tagsToAddIds.map((tagId) => {
              return {
                a: tagId,
                b: videoId,
              }
            }),
          )
        }

        return { duration, externalProviderId }
      })
    }),

  deleteUpload: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { videoId } = input

      const videoToDelete = await db.query.video.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, videoId)
        },
      })

      if (!videoToDelete) {
        throw new TRPCError({
          message: 'Video not found.',
          code: 'BAD_REQUEST',
        })
      }

      const objectsToDelete: ObjectIdentifier[] = []
      const deletionPromises: Promise<unknown>[] = []

      if (videoToDelete.storageKey) {
        objectsToDelete.push({
          Key: videoToDelete.storageKey,
        })
      }

      if (videoToDelete.audioStorageKey) {
        objectsToDelete.push({
          Key: videoToDelete.audioStorageKey,
        })
      }

      if (videoToDelete.subtitlesStorageKey) {
        objectsToDelete.push({
          Key: videoToDelete.subtitlesStorageKey,
        })
      }

      if (objectsToDelete.length > 0) {
        deletionPromises.push(
          r2.send(
            new DeleteObjectsCommand({
              Bucket: env.CLOUDFLARE_STORAGE_BUCKET_NAME,
              Delete: {
                Objects: objectsToDelete,
                Quiet: true,
              },
            }),
          ),
        )
      }

      if (videoToDelete.externalProviderId) {
        /**
         * TODO: delete video on bunny
         */
      }

      deletionPromises.push(db.delete(video).where(eq(video.id, videoId)))

      await Promise.all(deletionPromises)
    }),
})
