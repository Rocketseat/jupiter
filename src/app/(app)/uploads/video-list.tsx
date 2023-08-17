'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from './components/data-table'
import axios from 'axios'
import { columns } from './components/columns'
import { PaginationState } from '@tanstack/react-table'
import useDebounceValue from '@/hooks/useDebounceValue'

export function VideoList() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [tagsFilter, setTagsFilter] = useState<string[]>([])
  const [titleFilter, setTitleFilter] = useState('')

  function handleTitleFilter(title: string) {
    setTitleFilter(title)

    setPagination((state) => {
      return { ...state, pageIndex: 0 }
    })
  }

  function handleTagsFilter(tags: string[]) {
    setTagsFilter(tags)

    setPagination((state) => {
      return { ...state, pageIndex: 0 }
    })
  }

  const titleSearchTerm = useDebounceValue(titleFilter, 300)

  const { data: videoList, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['videos', pageIndex, pageSize, tagsFilter, titleSearchTerm],
    queryFn: async () => {
      const response = await axios.get('/api/videos', {
        params: {
          pageIndex,
          pageSize,
          tagsFilter,
          titleFilter: titleSearchTerm,
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
      titleFilter={titleFilter}
      tagsFilter={tagsFilter}
      onTitleFilterChange={handleTitleFilter}
      onTagsFilterChange={handleTagsFilter}
    />
  )
}
