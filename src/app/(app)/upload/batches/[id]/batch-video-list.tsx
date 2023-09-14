'use client'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'
import { SymbolIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Video, Music2, CopyIcon, Link2, Loader2, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { BatchVideoSkeletonTable } from './batch-video-skeleton-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { TranscriptionPreview } from '@/components/transcription-preview'
import { formatBytes } from '@/utils/format-bytes'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'

dayjs.extend(relativeTime)

export interface BatchVideoListProps {
  batchId: string
}

export function BatchVideoList({ batchId }: BatchVideoListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: batch,
    isLoading: isLoadingBatch,
    isRefetching: isRefetchingBatch,
  } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const response = await axios.get(`/api/batches/${batchId}`)

      return response.data.batch
    },
    refetchInterval: 15 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  const { isLoading: isDeletingVideo, mutateAsync: deleteVideo } = useMutation(
    async (videoId: string) => {
      await axios.delete(`/api/videos/${videoId}`)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['batch', batchId])
      },
    },
  )

  async function handleDeleteVideo(videoId: string) {
    try {
      await deleteVideo(videoId)

      setIsDeleteDialogOpen(false)
    } catch {
      toast({
        title: 'Uh oh! Something went wrong.',
        description:
          'An error ocurred while trying to delete the video. If the error persists, please contact an administrator.',
        variant: 'destructive',
        action: (
          <ToastAction
            altText="Try again"
            disabled={isDeletingVideo}
            onClick={() => handleDeleteVideo(videoId)}
          >
            Try again
          </ToastAction>
        ),
      })
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 40 }}></TableHead>
              <TableHead style={{ width: 400 }}>
                <div className="flex items-center gap-2">
                  <span>Video</span>
                  {isRefetchingBatch && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
              </TableHead>
              <TableHead style={{ width: 140 }}>Duration</TableHead>
              <TableHead style={{ width: 140 }}>Size</TableHead>
              <TableHead style={{ width: 200 }}>Transcription</TableHead>
              <TableHead style={{ width: 240 }}>External ID (Panda)</TableHead>
              <TableHead style={{ width: 60 }}></TableHead>
            </TableRow>
          </TableHeader>

          {isLoadingBatch ? (
            <BatchVideoSkeletonTable />
          ) : (
            <TableBody>
              {batch.videos.length ? (
                batch.videos.map((video: any) => (
                  <AlertDialog
                    key={video.id}
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <TableRow>
                      <TableCell className="text-center">
                        {video.uploadOrder}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium"></span>
                          <Link
                            href={`/videos/${video.id}`}
                            prefetch={false}
                            className="text-violet-500 hover:underline dark:text-violet-300"
                          >
                            {video.title}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {video.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatSecondsToMinutes(video.duration)}
                      </TableCell>
                      <TableCell>{formatBytes(video.sizeInBytes)}</TableCell>
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
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              disabled={!video.externalProviderId}
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  `https://b-vz-762f4670-e04.tv.pandavideo.com.br/${video.externalProviderId}/playlist.m3u8`,
                                )
                              }
                            >
                              <Link2 className="mr-2 h-4 w-4" />
                              <span>Copy HLS</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a
                                href={`/api/videos/${video.id}/download/video`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Video className="mr-2 h-4 w-4" />
                                <span>Download MP4</span>
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a
                                href={`/api/videos/${video.id}/download/audio`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Music2 className="mr-2 h-4 w-4" />
                                <span>Download MP3</span>
                              </a>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem disabled={isDeletingVideo}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                              <p>
                                This action can&apos;t be undone and the video
                                will be permanently deleted from the server.
                              </p>
                              <p>
                                This will{' '}
                                <span className="font-semibold text-accent-foreground">
                                  permanently
                                </span>
                                :
                              </p>
                              <ol className="list-disc space-y-2 pl-4">
                                <li>
                                  Delete the MP4, MP3 and subtitles from
                                  storage;
                                </li>
                                <li>Delete the video on external provider;</li>
                                <li>
                                  Delete the videos on any outside integration;
                                </li>
                              </ol>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button
                              disabled={isDeletingVideo}
                              variant="destructive"
                              className="w-20"
                              onClick={() => handleDeleteVideo(video.id)}
                            >
                              {isDeletingVideo ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </TableCell>
                    </TableRow>
                  </AlertDialog>
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
