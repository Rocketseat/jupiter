'use client'

import { SymbolIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Cable, CopyIcon, Loader2, ReceiptText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { CopyButton } from '@/components/copy-button'
import { TranscriptionPreview } from '@/components/transcription-preview'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UploadItemActions } from '@/components/upload-item-actions'
import { api } from '@/lib/eden'
import { formatBytes } from '@/utils/format-bytes'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'

import { BatchUploadSkeletonTable } from './batch-upload-skeleton-table'

dayjs.extend(relativeTime)

export interface BatchUploadListProps {
  batchId: string
}

export function BatchUploadList({ batchId }: BatchUploadListProps) {
  const {
    data: batch,
    isLoading: isLoadingBatch,
    isRefetching: isRefetchingBatch,
  } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const { data, error } = await api.batches[batchId].get()

      if (error) {
        throw error
      }

      return data.batch
    },
    refetchInterval: 15 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 54 }}></TableHead>
              <TableHead style={{ width: 400 }}>
                <div className="flex items-center gap-2">
                  <span>Video</span>
                  {isRefetchingBatch && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
              </TableHead>
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
              <TableHead style={{ width: 200 }}></TableHead>
              <TableHead style={{ width: 60 }}></TableHead>
            </TableRow>
          </TableHeader>

          {isLoadingBatch ? (
            <BatchUploadSkeletonTable />
          ) : (
            <TableBody>
              {batch && batch.videos.length ? (
                batch.videos.map((video) => (
                  <TableRow
                    key={video.id}
                    className="has-[a:focus-visible]:bg-accent"
                  >
                    <TableCell className="text-right font-medium">
                      {video.uploadOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/videos/${video.id}`}
                          prefetch={false}
                          className="font-medium text-primary outline-none hover:underline"
                        >
                          {video.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {video.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatSecondsToMinutes(video.duration)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatBytes(video.sizeInBytes)}
                    </TableCell>
                    <TableCell>
                      {video.transcription ? (
                        <TranscriptionPreview videoId={video.id} />
                      ) : (
                        <div className="flex items-center font-medium">
                          <SymbolIcon className="mr-2 h-3 w-3 animate-spin" />
                          <span className="text-muted-foreground">
                            Processing
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {video.externalProviderId ? (
                        <div className="flex items-center gap-2 font-medium">
                          <span className="truncate text-xs text-muted-foreground">
                            {video.externalProviderId}
                          </span>
                          <CopyButton
                            size="xs"
                            variant="outline"
                            textToCopy={video.externalProviderId}
                          >
                            <CopyIcon className="mr-1 h-3 w-3" />
                            Copy
                          </CopyButton>
                        </div>
                      ) : (
                        <div className="flex items-center font-medium">
                          <SymbolIcon className="mr-2 h-3 w-3 animate-spin" />
                          <span className="text-muted-foreground">
                            Processing
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <time title={video.createdAt.toLocaleString()}>
                          {dayjs(video.createdAt).fromNow()}
                        </time>
                        {video.author?.image && (
                          <Tooltip>
                            <div className="flex items-center gap-2">
                              <span>by</span>
                              <TooltipTrigger asChild>
                                <Image
                                  src={video.author?.image}
                                  className="size-5 rounded-full"
                                  width={20}
                                  height={20}
                                  alt=""
                                />
                              </TooltipTrigger>
                              {video.author?.name && (
                                <TooltipContent>
                                  {video.author?.name}
                                </TooltipContent>
                              )}
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <UploadItemActions videoId={video.id} />
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
          )}
        </Table>
      </div>
    </>
  )
}
