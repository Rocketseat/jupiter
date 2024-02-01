'use client'

import { Filter, Loader2, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState, useTransition } from 'react'

import { TagInput } from '@/components/tag-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function UploadsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPendingFilterTransition, startTransition] = useTransition()

  const [title, setTitle] = useState(searchParams.get('titleFilter') ?? '')
  const [tags, setTags] = useState<string[]>(
    searchParams.getAll('tagsFilter') ?? [],
  )

  function handleFilter(event: FormEvent) {
    event.preventDefault()

    const params = new URLSearchParams(searchParams)

    params.set('titleFilter', title)

    params.delete('tagsFilter')

    tags.forEach((tag) => params.append('tagsFilter', tag))

    startTransition(() => {
      router.push(`/uploads?${params.toString()}`)
    })
  }

  function handleResetFilters() {
    setTitle('')
    setTags([])

    const params = new URLSearchParams(searchParams)

    params.delete('titleFilter')
    params.delete('tagsFilter')

    router.push(`/uploads?${params.toString()}`)
  }

  const hasFilters = title !== '' || tags.length > 0

  return (
    <form onSubmit={handleFilter} className="flex items-center gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Filter videos..."
        className="h-8 w-auto"
      />

      <TagInput value={tags} onValueChange={setTags} allowTagCreation={false} />

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
