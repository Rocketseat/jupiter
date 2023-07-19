'use client'

import {
  DotsHorizontalIcon,
  Pencil2Icon,
  StackIcon,
} from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Video } from '../data/schema'
import { Link2, Music2, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'

interface DataTableRowActionsProps {
  row: Row<Video>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  return (
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
          <Link href={`/videos/${row.original.id}`}>
            <Pencil2Icon className="mr-2 h-4 w-4" />
            <span>Review</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!row.original.externalProviderId}
          onClick={() =>
            navigator.clipboard.writeText(
              `https://b-vz-762f4670-e04.tv.pandarow.original.com.br/${row.original.externalProviderId}/playlist.m3u8`,
            )
          }
        >
          <Link2 className="mr-2 h-4 w-4" />
          <span>Copy HLS</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/upload/batches/${row.original.uploadBatchId}`}>
            <StackIcon className="mr-2 h-4 w-4" />
            <span>View batch</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`/api/videos/${row.original.id}/download/video`}
            target="_blank"
            rel="noreferrer"
          >
            <VideoIcon className="mr-2 h-4 w-4" />
            <span>Download MP4</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`/api/videos/${row.original.id}/download/audio`}
            target="_blank"
            rel="noreferrer"
          >
            <Music2 className="mr-2 h-4 w-4" />
            <span>Download MP3</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
