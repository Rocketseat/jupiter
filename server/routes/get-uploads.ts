import { Prisma } from '@prisma/client'
import { Elysia, t } from 'elysia'

import { prisma } from '@/lib/prisma'

export const getUploads = new Elysia().get(
  '/videos',
  async ({ query }) => {
    const { pageIndex, pageSize, titleFilter, tagsFilter } = query

    const where: Prisma.VideoWhereInput = {}

    if (titleFilter) {
      where.title = {
        contains: titleFilter,
        mode: 'insensitive',
      }
    }

    if (tagsFilter && tagsFilter.length > 0) {
      where.tags = {
        some: {
          slug: {
            in: Array.isArray(tagsFilter) ? tagsFilter : [tagsFilter],
          },
        },
      }
    }

    const [videos, count] = await Promise.all([
      prisma.video.findMany({
        include: {
          transcription: {
            select: {
              id: true,
            },
          },
        },
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: pageIndex * pageSize,
        take: pageSize,
      }),
      prisma.video.count({
        where,
      }),
    ])

    const pageCount = Math.ceil(count / pageSize)

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
