import dayjs from 'dayjs'
import { gte, sum } from 'drizzle-orm'
import { HardDrive } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/drizzle/client'
import { video } from '@/drizzle/schema'
import { formatBytes } from '@/utils/format-bytes'

export const revalidate = 60 * 15 // 15 minutes

export async function Storage() {
  const [[{ sizeInBytesOverall }], [{ sizeInBytesLastMonth }]] =
    await Promise.all([
      db
        .select({ sizeInBytesOverall: sum(video.sizeInBytes).mapWith(Number) })
        .from(video),

      db
        .select({
          sizeInBytesLastMonth: sum(video.sizeInBytes).mapWith(Number),
        })
        .from(video)
        .where(gte(video.createdAt, dayjs().subtract(30, 'days').toDate())),
    ])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Storage</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="text-2xl font-bold">
          {formatBytes(sizeInBytesOverall ?? 0)}
        </span>
        <p className="text-xs text-muted-foreground">
          + {formatBytes(sizeInBytesLastMonth ?? 0)} in last 30 days
        </p>
      </CardContent>
    </Card>
  )
}
