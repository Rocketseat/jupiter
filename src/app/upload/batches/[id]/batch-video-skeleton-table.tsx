import { Skeleton } from "@/components/ui/skeleton"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

export interface BatchVideoSkeletonTableProps {
  rows?: number
}

export function BatchVideoSkeletonTable({ rows = 8 }: BatchVideoSkeletonTableProps) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, row) => {
        return (
          <TableRow key={row}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Skeleton className="w-[200px] h-4" />
                <Skeleton className="w-[240px] h-4" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="w-[60px] h-4" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-[200px] h-4" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-[200px] h-4" />
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  )
}