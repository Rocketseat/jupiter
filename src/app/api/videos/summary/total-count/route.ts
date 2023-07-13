import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [total, lastMonth] = await Promise.all([
      prisma.video.aggregate({
        _count: {
          _all: true,
        },
      }),

      prisma.video.aggregate({
        _count: {
          _all: true,
        },
        where: {
          createdAt: {
            gte: dayjs().subtract(30, 'days').toDate(),
          },
        },
      }),
    ])

    return NextResponse.json({
      total: total._count._all,
      lastMonth: lastMonth._count._all,
    })
  } catch (err) {
    console.log(err)
  }
}
