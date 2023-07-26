import { HardDrive } from 'lucide-react'
import { prisma } from '@/lib/prisma'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBytes } from '@/utils/format-bytes'
import dayjs from 'dayjs'

export const revalidate = 60 * 15 // 15 minutes

export async function Storage() {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Storage</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="text-2xl font-bold">
          {formatBytes(total._sum.sizeInBytes ?? 0)}
        </span>
        <p className="text-xs text-muted-foreground">
          + {formatBytes(lastMonth._sum.sizeInBytes ?? 0)} in last 30 days
        </p>
      </CardContent>
    </Card>
  )
}
