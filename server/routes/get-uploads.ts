import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
} from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { tag, tagToVideo, transcription, video } from '@/drizzle/schema'

export const getUploads = new Elysia().get(
  '/videos',
  async ({ query }) => {
    const { pageIndex, pageSize, titleFilter, tagsFilter } = query

    const videoColumns = getTableColumns(video)

    const [videos, [{ amount }]] = await Promise.all([
      db
        .select({
          ...videoColumns,
          transcription: transcription.id,
        })
        .from(video)
        .leftJoin(tagToVideo, eq(tagToVideo.b, video.id))
        .leftJoin(tag, eq(tag.id, tagToVideo.a))
        .leftJoin(transcription, eq(transcription.videoId, video.id))
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
        )
        .orderBy(desc(video.createdAt))
        .offset(pageIndex * pageSize)
        .limit(pageSize)
        .groupBy(video.id, transcription.id),

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
  },
  {
    query: t.Object({
      titleFilter: t.Optional(t.String()),
      tagsFilter: t.Optional(t.Union([t.Array(t.String()), t.String()])),
      pageIndex: t.Numeric({ default: 0 }),
      pageSize: t.Numeric({ default: 10 }),
    }),
  },
)
