import { Cable, ReceiptText } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Loading() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video</TableHead>
            <TableHead style={{ width: 120 }}>Duration</TableHead>
            <TableHead style={{ width: 140 }}>Size</TableHead>
            <TableHead style={{ width: 200 }}>
              <div className="flex items-center gap-2">
                <ReceiptText className="size-4" />
                Transcription
              </div>
            </TableHead>
            <TableHead style={{ width: 200 }}>
              <div className="flex items-center gap-2">
                <Cable className="size-4" />
                External ID
              </div>
            </TableHead>
            <TableHead style={{ width: 150 }}>Uploaded at</TableHead>
            <TableHead style={{ width: 64 }} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, row) => {
            return (
              <TableRow key={row}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-[160px]" />
                    <Skeleton className="h-4 w-[240px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
