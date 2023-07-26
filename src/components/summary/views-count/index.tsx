import dayjs from 'dayjs'
import { BarChart } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { env } from '@/env'
import { ViewsCountChart } from './views-count-chart'

export const revalidate = 60 * 60 * 1 // 1 hour

interface PandaAnalyticsResponse {
  views_data: Record<
    string,
    {
      play: number
      unique_play: number
    }
  >
}

export async function ViewsCount() {
  const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
  const endDate = dayjs().format('YYYY-MM-DD')

  const analyticsURL = new URL('/general', 'https://data.pandavideo.com')

  analyticsURL.searchParams.append('start_date', startDate)
  analyticsURL.searchParams.append('end_date', endDate)

  const response = await fetch(analyticsURL, {
    headers: {
      Authorization: env.PANDAVIDEO_API_KEY,
    },
  })

  const analyticsData: PandaAnalyticsResponse = await response.json()

  const chartData = Object.entries(analyticsData.views_data).map(
    ([date, metrics]) => {
      return {
        date: dayjs(date).format('MMM D'),
        plays: metrics.play,
        unique: metrics.unique_play,
      }
    },
  )

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Videos</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>
          Video plays and unique plays analytics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <ViewsCountChart data={chartData} />
      </CardContent>
    </Card>
  )
}
