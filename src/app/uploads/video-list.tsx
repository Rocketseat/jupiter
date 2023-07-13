'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from './components/data-table'
import axios from 'axios'
import { columns } from './components/columns'
import { PaginationState } from '@tanstack/react-table'

export function VideoList() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: videoList, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['videos', pageIndex, pageSize],
    queryFn: async () => {
      const response = await axios.get('/api/videos', {
        params: {
          pageIndex,
          pageSize,
        },
      })

      const { videos, pageCount } = response.data

      return { videos, pageCount }
    },
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  })

  return (
    <DataTable
      data={videoList?.videos}
      isLoading={isLoadingVideos}
      columns={columns}
      pageCount={videoList?.pageCount ?? 0}
      pagination={{ pageIndex, pageSize }}
      onPaginationChange={setPagination}
    />
  )
}
