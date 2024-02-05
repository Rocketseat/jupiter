import dayjs from 'dayjs'
import { count, gte } from 'drizzle-orm'
import { BarChart } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/drizzle/client'
import { video } from '@/drizzle/schema'

export const revalidate = 60 * 15 // 15 minutes

export async function TotalCount() {
  const [[{ amountOverall }], [{ amountLastMonth }]] = await Promise.all([
    db.select({ amountOverall: count().mapWith(Number) }).from(video),

    db
      .select({
        amountLastMonth: count().mapWith(Number),
      })
      .from(video)
      .where(gte(video.createdAt, dayjs().subtract(30, 'days').toDate())),
  ])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Videos</CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="text-2xl font-bold">
          {String(amountOverall).padStart(4, '0')}
        </span>
        <p className="text-xs text-muted-foreground">
          + {amountLastMonth} in last 30 days
        </p>
      </CardContent>
    </Card>
  )
}
