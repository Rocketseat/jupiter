import { Elysia, t } from 'elysia'

import { prisma } from '@/lib/prisma'

export const getTags = new Elysia().get(
  '/tags/search',
  async ({ query }) => {
    const { q: search, pageIndex, pageSize } = query

    const slugSearch = search.length ? { contains: search } : undefined

    const [tags, count] = await Promise.all([
      prisma.tag.findMany({
        where: {
          slug: slugSearch,
        },
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.tag.count({
        where: {
          slug: slugSearch,
        },
      }),
    ])

    const pageCount = Math.ceil(count / pageSize) ?? 0

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
