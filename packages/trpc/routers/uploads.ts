import { DeleteObjectsCommand, ObjectIdentifier, r2 } from '@nivo/cloudflare'
import { db } from '@nivo/drizzle'
import { tag, tagToUpload, upload, user } from '@nivo/drizzle/schema'
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

      const upload = await db.query.upload.findFirst({
        with: {
          tagToUploads: {
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

      const { tagToUploads, ...video } = upload

      return {
        video: {
          ...video,
          tags: tagToUploads.map((tagToUpload) => tagToUpload.tag),
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

      const videoColumns = getTableColumns(upload)

      const [videos, [{ amount }]] = await Promise.all([
        db
          .select({
            ...videoColumns,
            author: {
              name: user.name,
              image: user.image,
            },
          })
          .from(upload)
          .leftJoin(tagToUpload, eq(tagToUpload.uploadId, upload.id))
          .leftJoin(tag, eq(tag.id, tagToUpload.tagId))
          .leftJoin(user, eq(upload.authorId, user.id))
          .where(
            and(
              eq(upload.companyId, companyId),
              tagsFilter ? inArray(tag.slug, tagsFilter) : undefined,
              titleFilter ? ilike(upload.title, `%${titleFilter}%`) : undefined,
            ),
          )
          .orderBy(desc(upload.createdAt))
          .offset(pageIndex * pageSize)
          .limit(pageSize)
          .groupBy(upload.id, user.name, user.image),

        db
          .select({ amount: count() })
          .from(upload)
          .leftJoin(tagToUpload, eq(tagToUpload.uploadId, upload.id))
          .leftJoin(tag, eq(tag.id, tagToUpload.tagId))
          .where(
            and(
              tagsFilter
                ? inArray(
                    tag.slug,
                    Array.isArray(tagsFilter) ? tagsFilter : [tagsFilter],
                  )
                : undefined,
              titleFilter ? ilike(upload.title, `%${titleFilter}%`) : undefined,
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

      const videoFromCompany = await db.query.upload.findFirst({
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
        .innerJoin(tagToUpload, eq(tagToUpload.a, tag.id))
        .innerJoin(upload, eq(tagToUpload.b, upload.id))
        .where(eq(upload.id, videoId))

      const currentVideoTagsSlugs = currentVideoTags.map((item) => item.slug)

      const tagsToRemoveIds = currentVideoTags
        .filter((item) => !tags.includes(item.slug))
        .map((item) => item.id)

      const tagsSlugsToAdd = tags.filter((slug) => {
        return !currentVideoTagsSlugs.includes(slug)
      })

      await db.transaction(async (tx) => {
        const [{ duration, externalProviderId }] = await tx
          .update(upload)
          .set({
            title,
            description,
            commitUrl,
          })
          .where(eq(upload.id, videoId))
          .returning({
            duration: upload.duration,
            externalProviderId: upload.externalProviderId,
          })

        if (tagsToRemoveIds.length > 0) {
          await tx
            .delete(tagToUpload)
            .where(
              and(
                eq(tagToUpload.uploadId, videoId),
                inArray(tagToUpload.tagId, tagsToRemoveIds),
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

          await tx.insert(tagToUpload).values(
            tagsToAddIds.map((tagId) => {
              return {
                tagId,
                uploadId: videoId,
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

      const videoToDelete = await db.query.upload.findFirst({
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

      deletionPromises.push(db.delete(upload).where(eq(upload.id, videoId)))

      await Promise.all(deletionPromises)
    }),
})
