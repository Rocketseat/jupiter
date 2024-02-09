'use client'

import { DotsHorizontalIcon, Pencil2Icon } from '@radix-ui/react-icons'
import { Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc'

interface UploadItemActionsProps {
  videoId: string
}

export function UploadItemActions({ videoId }: UploadItemActionsProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { mutateAsync: deleteVideo, isPending: isDeletingVideo } =
    trpc.deleteUpload.useMutation({
      onSuccess() {
        utils.getUploads.invalidate()
      },
    })

  async function handleDeleteVideo() {
    try {
      await deleteVideo({ videoId })

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
          <DropdownMenuItem asChild>
            <Link href={`/videos/${videoId}`} prefetch={false}>
              <Pencil2Icon className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-500 data-[highlighted]:text-red-500 dark:text-red-400 dark:data-[highlighted]:text-red-400"
              disabled={isDeletingVideo}
            >
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
