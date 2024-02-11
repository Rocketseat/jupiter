import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function WebhooksListLoading() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead style={{ width: 120 }}>Triggers</TableHead>
            <TableHead style={{ width: 164 }}>Last 7 days</TableHead>
            <TableHead style={{ width: 96 }} className="text-right">
              Error rate
            </TableHead>
            <TableHead style={{ width: 96 }}>Status</TableHead>
            <TableHead style={{ width: 220 }}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 2 }).map((_, row) => {
            return (
              <TableRow key={row}>
                <TableCell className="py-1">
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="py-1">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="py-1">
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell className="py-1 text-right">
                  <Skeleton className="ml-auto h-6 w-8" />
                </TableCell>
                <TableCell className="py-1">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="space-x-2 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="inline-block h-6 w-28" />
                    <Skeleton className="inline-block h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
