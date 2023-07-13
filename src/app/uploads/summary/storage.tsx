import { HardDrive } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBytes } from '@/utils/format-bytes'
import { api } from '@/lib/api'

export async function Storage() {
  const response = await api.get('/api/videos/summary/storage')
  const { total, lastMonth } = response.data

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Storage</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="text-2xl font-bold">{formatBytes(total)}</span>
        <p className="text-xs text-muted-foreground">
          + {formatBytes(lastMonth)} in last 30 days
        </p>
      </CardContent>
    </Card>
  )
}
