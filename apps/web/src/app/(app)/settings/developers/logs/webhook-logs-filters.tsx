'use client'

import { Filter, Loader2, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function WebhookLogsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPendingFilterTransition, startTransition] = useTransition()

  const [events, setEvents] = useState<string[]>(
    searchParams.getAll('eventsFilter') ?? [],
  )

  function handleFilter(event: FormEvent) {
    event.preventDefault()

    const params = new URLSearchParams(searchParams)

    params.delete('eventsFilter')

    events.forEach((event) => params.append('eventsFilter', event))

    startTransition(() => {
      router.push(`/settings/developers/logs?${params.toString()}`)
    })
  }

  function handleResetFilters() {
    setEvents([])

    const params = new URLSearchParams(searchParams)

    params.delete('eventsFilter')

    startTransition(() => {
      router.push(`/settings/developers/logs?${params.toString()}`)
    })
  }

  const hasFilters = events.length > 0

  return (
    <form onSubmit={handleFilter} className="flex items-center gap-2">
      <Select>
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Filter by event" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="font-mono text-xs" value="upload.created">
            upload.created
          </SelectItem>
          <SelectItem
            className="font-mono text-xs"
            value="transcription.created"
          >
            transcription.created
          </SelectItem>
          <SelectItem className="font-mono text-xs" value="upload.processed">
            upload.processed
          </SelectItem>
          <SelectItem className="font-mono text-xs" value="upload.updated">
            upload.updated
          </SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" size="sm" variant="secondary">
        {isPendingFilterTransition ? (
          <Loader2 className="mr-2 size-3 animate-spin" />
        ) : (
          <Filter className="mr-2 size-3" />
        )}
        Filter
      </Button>

      <Button
        onClick={handleResetFilters}
        disabled={!hasFilters}
        type="button"
        size="sm"
        variant="outline"
      >
        <X className="mr-2 size-3" />
        Reset
      </Button>
    </form>
  )
}
