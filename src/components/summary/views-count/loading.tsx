import { BarChart, Loader2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ViewsCountLoading() {
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
      <CardContent>
        <div className="flex h-[350px] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading chart...</span>
        </div>
      </CardContent>
    </Card>
  )
}
