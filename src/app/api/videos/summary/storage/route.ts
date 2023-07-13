import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import dayjs from 'dayjs'

export async function GET() {
  try {
    const [total, lastMonth] = await Promise.all([
      prisma.video.aggregate({
        _sum: {
          sizeInBytes: true,
        },
      }),
      prisma.video.aggregate({
        _sum: {
          sizeInBytes: true,
        },
        where: {
          createdAt: {
            gte: dayjs().subtract(30, 'days').toDate(),
          },
        },
      }),
    ])

    return NextResponse.json({
      total: total._sum.sizeInBytes ?? 0,
      lastMonth: lastMonth._sum.sizeInBytes ?? 0,
    })
  } catch (err) {
    console.log(err)
  }
}
