'use client'

import { useEffect, useState } from 'react'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'

import { Loader2, Video } from 'lucide-react'
import { Button } from './ui/button'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRouter } from 'next/navigation'
import useDebounceValue from '@/hooks/useDebounceValue'

dayjs.extend(relativeTime)

export function Search() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const searchTerm = useDebounceValue(search, 300)

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      const response = await axios.get('/api/videos/search', {
        params: {
          q: searchTerm,
        },
      })

      return response.data.videos
    },
    enabled: open,
  })

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
        className="flex w-[240px] items-center justify-between text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        Search videos...
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-sm">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search videos..."
        />
        <CommandList>
          <CommandGroup heading="Recent uploads">
            {isLoadingVideos ? (
              <div className="flex cursor-default select-none items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading videos...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="flex h-full cursor-default select-none items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              videos.map((video: any) => {
                return (
                  <CommandItem
                    onSelect={() => router.push(`/videos/${video.id}`)}
                    key={video.id}
                    value={video.id}
                  >
                    <Video className="mr-2 h-3 w-3" />
                    <span>{video.title}</span>
                    <span className="ml-auto text-muted-foreground">
                      {dayjs(video.createdAt).fromNow()}
                    </span>
                  </CommandItem>
                )
              })
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
