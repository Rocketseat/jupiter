import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function Loading() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="size-4" />
      </CardHeader>
      <CardContent className="space-y-1">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}
