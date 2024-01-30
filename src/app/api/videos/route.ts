import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const pageIndex = z.coerce
    .number()
    .default(0)
    .parse(searchParams.get('pageIndex'))

  const pageSize = z.coerce
    .number()
    .default(10)
    .parse(searchParams.get('pageSize'))

  const tagsFilter = z
    .array(z.string())
    .parse(searchParams.getAll('tagsFilter[]'))

  const titleFilter = z.string().parse(searchParams.get('titleFilter'))

  try {
    const [videos, count] = await Promise.all([
      prisma.video.findMany({
        include: {
          transcription: {
            select: {
              id: true,
            },
          },
        },
        where: {
          title: titleFilter
            ? {
                search: titleFilter.split(' ').join(' & '),
              }
            : undefined,
          tags:
            tagsFilter.length > 0
              ? {
                  some: {
                    slug: {
                      in: tagsFilter,
                    },
                  },
                }
              : undefined,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: pageIndex * pageSize,
        take: pageSize,
      }),
      prisma.video.count({
        where: {
          title: titleFilter
            ? {
                search: titleFilter.split(' ').join(' & '),
              }
            : undefined,
          tags:
            tagsFilter.length > 0
              ? {
                  some: {
                    slug: {
                      in: tagsFilter,
                    },
                  },
                }
              : undefined,
        },
      }),
    ])

    const pageCount = Math.ceil(count / pageSize)

    return NextResponse.json({ videos, pageCount })
  } catch (err) {
    console.log(err)
  }
}
