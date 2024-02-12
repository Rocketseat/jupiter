'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import useDebounceValue from '@/hooks/useDebounceValue'
import { trpc } from '@/lib/trpc/react'

import { Button } from '../ui/button'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandList,
} from '../ui/command'
import { SearchItem } from './search-item'

export function Search() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const searchTerm = useDebounceValue(search, 300)

  const {
    data,
    isLoading: isLoadingVideos,
    isPending: isPendingVideos,
  } = trpc.getUploads.useQuery(
    {
      titleFilter: searchTerm,
      pageSize: 5,
      pageIndex: 0,
    },
    {
      enabled: open,
    },
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex w-[240px] items-center justify-between text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        Search videos...
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-semibold text-muted-foreground opacity-100">
          <span className="text-sm">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search videos..."
        />
        <CommandList className="h-auto">
          <CommandGroup heading="Recent uploads">
            {isPendingVideos || isLoadingVideos ? (
              <div className="flex cursor-default select-none items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading videos...</span>
              </div>
            ) : data?.videos && data.videos.length === 0 ? (
              <div className="flex h-full cursor-default select-none items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              data?.videos &&
              data.videos.map((video) => {
                return (
                  <SearchItem
                    key={video.id}
                    onRequestClose={() => setOpen(false)}
                    video={video}
                  />
                )
              })
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
