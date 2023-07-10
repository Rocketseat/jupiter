'use client'

import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Checkbox } from '@/components/ui/checkbox'

import { statuses } from '../data/data'
import { Task } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Progress } from '@/components/ui/progress'
import { Link2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'

dayjs.extend(relativeTime)

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    size: 32,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'id',
  //   header: 'ID',
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'title',
    header: 'Title',
    size: 600,
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-4">
          <div className="flex max-w-[500px] flex-col">
            <span className="truncate font-medium">
              {row.getValue('title')}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {row.original.tags.join(', ')}
            </span>
          </div>

          <Button
            onClick={() => navigator.clipboard.writeText(row.original.url)}
            size="xs"
            variant="ghost"
            className="px-1"
          >
            <Link2Icon className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status'),
      )

      if (!status) {
        return null
      }

      if (status.value === 'progress') {
        return <Progress className="w-[120px] " max={100} value={40} />
      }

      return (
        <div className="flex w-[120px] items-center font-medium">
          {status.icon && <status.icon className="mr-2 h-4 w-4" />}
          <span className="text-muted-foreground">{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'uploadedAt',
    header: 'Uploaded At',
    cell: ({ row }) => {
      const parsedUploadedAt = dayjs(row.original.uploadedAt)

      return (
        <span title={parsedUploadedAt.format('DD/MM/YYYY[ ]HH:mm')}>
          {parsedUploadedAt.fromNow()}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    size: 60,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
