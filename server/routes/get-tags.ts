import { count, ilike } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { tag } from '@/drizzle/schema'

export const getTags = new Elysia().get(
  '/tags/search',
  async ({ query }) => {
    const { q: search, pageIndex, pageSize } = query

    const [tags, [{ amount }]] = await Promise.all([
      db.query.tag.findMany({
        where(fields, { ilike }) {
          if (search) {
            return ilike(fields.slug, `%${search}%`)
          }

          return undefined
        },
        offset: pageIndex * pageSize,
        limit: pageSize,
        orderBy(fields, { desc }) {
          return desc(fields.createdAt)
        },
      }),
      db
        .select({ amount: count() })
        .from(tag)
        .where(search ? ilike(tag.slug, `%${search}%`) : undefined),
    ])

    const pageCount = Math.ceil(amount / pageSize) ?? 0

    return { tags, pageCount }
  },
  {
    query: t.Object({
      q: t.String(),
      pageIndex: t.Numeric({ default: 0 }),
      pageSize: t.Numeric({ default: 20 }),
    }),
  },
)
