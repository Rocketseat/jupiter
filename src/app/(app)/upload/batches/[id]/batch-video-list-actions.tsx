'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Video, Music2, Link2, Loader2, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
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

type BatchVideoListActionsProps = {
  batchId: string
  video: any
}

export function BatchVideoListActions({
  video,
  batchId,
}: BatchVideoListActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { isLoading: isDeletingVideo, mutateAsync: deleteVideo } = useMutation(
    async () => {
      await axios.delete(`/api/videos/${video.id}`)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['batch', batchId])
      },
    },
  )

  async function handleDeleteVideo() {
    try {
      await deleteVideo()

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
            onClick={handleDeleteVideo}
          >
            Try again
          </ToastAction>
        ),
      })
    }
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              This action can&apos;t be undone and the video will be permanently
              deleted from the server.
            </p>
            <p>
              This will{' '}
              <span className="font-semibold text-accent-foreground">
                permanently
              </span>
              :
            </p>
            <ol className="list-disc space-y-2 pl-4">
              <li>Delete the MP4, MP3 and subtitles from storage;</li>
              <li>Delete the video on external provider;</li>
              <li>Delete the videos on any outside integration;</li>
            </ol>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            disabled={isDeletingVideo}
            variant="destructive"
            className="w-20"
            onClick={handleDeleteVideo}
          >
            {isDeletingVideo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Delete'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
