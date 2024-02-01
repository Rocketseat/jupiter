import { Skeleton } from '@/components/ui/skeleton'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'

export interface BatchUploadSkeletonTableProps {
  rows?: number
}

export function BatchUploadSkeletonTable({
  rows = 8,
}: BatchUploadSkeletonTableProps) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, row) => {
        return (
          <TableRow key={row}>
            <TableCell>
              <Skeleton className="h-4 w-[24px]" />
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[240px]" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[60px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[60px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[200px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[200px]" />
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  )
}
