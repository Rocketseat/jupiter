'use client'

import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Video } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { CopyIcon, SymbolIcon } from '@radix-ui/react-icons'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'
import { TranscriptionPreview } from '@/components/transcription-preview'
import { CopyButton } from '@/components/copy-button'
import { formatBytes } from '@/utils/format-bytes'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

dayjs.extend(relativeTime)

export const columns: ColumnDef<Video>[] = [
  {
    accessorKey: 'title',
    header: 'Video',
    size: 400,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link
              href={`/videos/${row.original.id}`}
              prefetch={false}
              className="text-violet-500 hover:underline dark:text-violet-300"
            >
              {row.original.title}
            </Link>

            {row.original.tags && (
              <div className="flex gap-1 py-0.5">
                {row.original.tags?.map((tag) => (
                  <Badge
                    variant="secondary"
                    key={tag.id}
                    className="pointer-events-none rounded-sm px-1 font-normal"
                  >
                    {tag.slug}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {row.original.id}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    size: 120,
    cell: ({ row }) => {
      return formatSecondsToMinutes(row.original.duration)
    },
  },
  {
    accessorKey: 'sizeInBytes',
    header: 'Size',
    size: 120,
    cell: ({ row }) => {
      return formatBytes(row.original.sizeInBytes)
    },
  },
  {
    accessorKey: 'transcription',
    header: 'Transcription',
    size: 200,
    cell: ({ row }) => {
      if (row.original.transcription) {
        return <TranscriptionPreview videoId={row.original.id} />
      } else {
        return (
          <div className="flex items-center font-medium">
            <SymbolIcon className="mr-2 h-3 w-3 animate-spin" />
            <span className="text-muted-foreground">Processing</span>
          </div>
        )
      }
    },
  },
  {
    accessorKey: 'externalProviderId',
    header: 'External ID (Panda)',
    size: 240,
    cell: ({ row }) => {
      if (row.original.externalProviderId) {
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="truncate text-xs text-muted-foreground">
              {row.original.externalProviderId}
            </span>
            <CopyButton
              size="xs"
              variant="outline"
              textToCopy={row.original.externalProviderId}
            >
              <CopyIcon className="mr-1 h-3 w-3" />
              Copy
            </CopyButton>
          </div>
        )
      } else {
        return (
          <div className="flex items-center font-medium">
            <SymbolIcon className="mr-2 h-3 w-3 animate-spin" />
            <span className="text-muted-foreground">Processing</span>
          </div>
        )
      }
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Uploaded at',
    size: 150,
    cell: ({ row }) => {
      return (
        <time
          title={row.original.createdAt.toLocaleString()}
          className="text-muted-foreground"
        >
          {dayjs(row.original.createdAt).fromNow()}
        </time>
      )
    },
  },
  {
    id: 'actions',
    size: 60,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
