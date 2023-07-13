import { BarChart } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

export async function TotalCount() {
  const response = await api.get('/api/videos/summary/total-count')
  const { total, lastMonth } = response.data

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Videos</CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="text-2xl font-bold">
          {String(total).padStart(4, '0')}
        </span>
        <p className="text-xs text-muted-foreground">
          + {lastMonth} in last 30 days
        </p>
      </CardContent>
    </Card>
  )
}
