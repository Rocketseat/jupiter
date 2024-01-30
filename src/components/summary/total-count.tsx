import dayjs from 'dayjs'
import { BarChart } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 * 15 // 15 minutes

export async function TotalCount() {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Videos</CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="text-2xl font-bold">
          {String(total._count._all).padStart(4, '0')}
        </span>
        <p className="text-xs text-muted-foreground">
          + {lastMonth._count._all} in last 30 days
        </p>
      </CardContent>
    </Card>
  )
}
