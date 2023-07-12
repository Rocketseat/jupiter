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
import { CopyIcon, DotsHorizontalIcon, Link1Icon, SymbolIcon } from '@radix-ui/react-icons'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link2, Music2, Video } from 'lucide-react'

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
  externalProviderId?: string
  uploadBatchId: string
  createdAt: string
  transcription?: {
    id: string
  } 
  processedAt?: Date
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
            This page refreshes automatically
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 400 }}>Video</TableHead>
              <TableHead style={{ width: 140 }}>Duration</TableHead>
              <TableHead style={{ width: 200 }}>Transcription</TableHead>
              <TableHead style={{ width: 200 }}>External ID (Panda)</TableHead>
              <TableHead style={{ width: 60 }}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.videos.length ? (
              batch.videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{video.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {video.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatSecondsToMinutes(video.duration)}
                  </TableCell>
                  <TableCell>
                    {video.transcription ? (
                      <a href="#" className="flex items-center font-medium text-violet-500 hover:text-violet-600">
                        <Link1Icon className="mr-2 h-4 w-4" />
                        <span>
                          View transcription
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center font-medium">
                        <SymbolIcon className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground">
                          Processing
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {video.externalProviderId ? (
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-muted-foreground text-xs truncate">
                          {video.externalProviderId}
                        </span>
                        <Button size="xs" variant="outline">
                          <CopyIcon className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center font-medium">
                        <SymbolIcon className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground">
                          Processing
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                        >
                          <DotsHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem>
                          <Link2 className="mr-2 h-4 w-4" />
                          <span>Copy HLS</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Video className="mr-2 h-4 w-4" />
                          <span>Download MP4</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Music2 className="mr-2 h-4 w-4" />
                          <span>Download MP3</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Delete
                          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
