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
import { tag, tagToVideo, transcription, user, video } from '@/drizzle/schema'

import { authentication } from './authentication'

export const getUploads = new Elysia().use(authentication).get(
  '/videos',
  async ({ query, getCurrentUser }) => {
    const { companyId } = await getCurrentUser()
    const { pageIndex, pageSize, titleFilter, tagsFilter } = query

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
