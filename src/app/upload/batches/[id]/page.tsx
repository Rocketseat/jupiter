import { Metadata } from 'next'
import dayjs from 'dayjs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SymbolIcon } from '@radix-ui/react-icons'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'

interface BatchPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: BatchPageProps): Promise<Metadata> {
  const id = params.id

  return {
    title: `Batch ${id}`,
  }
}

export interface Video {
  id: string
  duration: number
  title: string
  storageKey: string
  storageURL: string
  description?: string
  uploadBatchId: string
  createdAt: string
}

export interface Batch {
  id: string
  createdAt: string
  videos: Video[]
}

async function getBatchData(batchId: string): Promise<Batch> {
  const response = await fetch(`http://localhost:3000/api/batches/${batchId}`, {
    next: {
      revalidate: 60 * 60 * 2, // Every 2 hours
    },
  })

  const data = await response.json()

  return data.batch
}

export default async function BatchPage({ params }: BatchPageProps) {
  const batch = await getBatchData(params.id)

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Batch{' '}
          <span className="text-base font-medium text-muted-foreground">
            ({dayjs(batch.createdAt).format('DD/MM[ at ]HH:mm[h]')})
          </span>
        </h2>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            This page refreshes automatically.
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 200 }}>Video</TableHead>
              <TableHead style={{ width: 240 }}>
                Storage URL (Requires auth)
              </TableHead>
              <TableHead style={{ width: 200 }}>Duration</TableHead>
              <TableHead style={{ width: 200 }}>Transcription</TableHead>
              <TableHead style={{ width: 200 }}>External ID (Panda)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.videos.length ? (
              batch.videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>{video.title}</TableCell>
                  <TableCell>
                    <div className="max-w-[240px] truncate">
                      <a href={video.storageURL} className="text-violet-500">
                        {video.storageKey}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatSecondsToMinutes(video.duration)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <SymbolIcon className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">
                        Processing in background
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <SymbolIcon className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">
                        Processing in background
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={99} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
