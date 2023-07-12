import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

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
        skip: pageIndex * pageSize,
        take: pageSize,
      }),
      prisma.video.count(),
    ])

    const pageCount = Math.ceil(count / pageSize)

    return NextResponse.json({ videos, pageCount })
  } catch (err) {
    console.log(err)
  }
}
