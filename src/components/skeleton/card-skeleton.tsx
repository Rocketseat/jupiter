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
        <span className="text-2xl font-bold">
          <Skeleton className="h-6 w-32" />
        </span>
        <p className="text-xs text-muted-foreground">
          <Skeleton className="h-4 w-40" />
        </p>
      </CardContent>
    </Card>
  )
}
