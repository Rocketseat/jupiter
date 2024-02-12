import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Skeleton } from '../ui/skeleton'

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>
          <Skeleton className="h-6 w-24" />
        </CardTitle>
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="space-y-1">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  )
}
