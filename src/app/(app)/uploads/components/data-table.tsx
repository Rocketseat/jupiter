'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { VideoListSkeletonTable } from '../video-list-skeleton-table'
import { DataTableFilters, DataTableFiltersProps } from './data-table-filters'
import { DataTablePagination } from './data-table-pagination'

interface DataTableProps<TData, TValue> extends DataTableFiltersProps {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
  pagination: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  isLoading: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  isLoading,
  titleFilter,
  tagsFilter,
  onTitleFilterChange,
  onTagsFilterChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <DataTableFilters
        titleFilter={titleFilter}
        tagsFilter={tagsFilter}
        onTitleFilterChange={onTitleFilterChange}
        onTagsFilterChange={onTagsFilterChange}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      style={{ width: header.getSize() }}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          {isLoading ? (
            <VideoListSkeletonTable rows={pagination.pageSize} />
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    // loading={row.original('status') === 'progress'}
                    // data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {!isLoading && <DataTablePagination table={table} />}
    </div>
  )
}
