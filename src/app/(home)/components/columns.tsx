'use client'

import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import { statuses } from '../data/data'
import { Task } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Progress } from '@/components/ui/progress'

dayjs.extend(relativeTime)

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
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
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          {row.original.category && (
            <Badge variant="secondary">
              {row.original.category.toUpperCase()}
            </Badge>
          )}

          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('title')}
          </span>
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
        return <Progress className="h-2 bg-slate-200" max={100} value={40} />
      }

      return (
        <div className="flex w-[100px] items-center font-medium">
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
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {row.original.tags.map((tag) => {
            return (
              <Badge key={tag} variant="outline">
                {tag.toUpperCase()}
              </Badge>
            )
          })}
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
