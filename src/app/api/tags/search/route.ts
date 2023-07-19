import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const search = searchParams.get('q')

  const pageIndex = z.coerce
    .number()
    .default(0)
    .parse(searchParams.get('pageIndex'))

  const pageSize = z.coerce
    .number()
    .default(20)
    .parse(searchParams.get('pageSize'))

  const searchWhere: Prisma.TagWhereInput = {}

  if (search?.length) {
    searchWhere.slug = {
      contains: search,
    }
  }

  try {
    const [tags, count] = await Promise.all([
      prisma.tag.findMany({
        where: searchWhere,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.tag.count({
        where: searchWhere,
      }),
    ])

    const pageCount = Math.ceil(count / pageSize) ?? 0

    return NextResponse.json({ tags, pageCount })
  } catch (err) {
    console.log(err)
  }
}
