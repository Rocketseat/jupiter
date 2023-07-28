import { Loader2, Tag } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { CheckIcon, PlusIcon } from '@radix-ui/react-icons'
import { twMerge } from 'tailwind-merge'
import { useQuery } from '@tanstack/react-query'
import useDebounceValue from '@/hooks/useDebounceValue'
import { useState } from 'react'
import axios from 'axios'
import { Dialog } from './ui/dialog'
import { CreateNewTagDialog } from './create-new-tag-dialog'
import { ScrollArea } from './ui/scroll-area'

export interface TagInputProps {
  value: string[]
  onValueChange: (tags: string[]) => void
  error?: string
  previewTagsAmount?: number
  onApplyToAll?: () => void
}

export function TagInput({
  value,
  onValueChange,
  error,
  previewTagsAmount = 5,
  onApplyToAll,
}: TagInputProps) {
  const [createTagDialogOpen, setCreateTagDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const searchTerm = useDebounceValue(search, 300)

  const { data: tagOptions, isLoading: isLoadingTagOptions } = useQuery({
    queryKey: ['tags', searchTerm],
    queryFn: async () => {
      const response = await axios.get('/api/tags/search', {
        params: {
          q: searchTerm,
          pageSize: 20,
        },
      })

      return response.data.tags
    },
    enabled: open,
  })

  function handleAddTag(tag: string) {
    onValueChange([...value, tag])
  }

  function handleRemoveTag(tag: string) {
    onValueChange(value.filter((item) => item !== tag))
  }

  return (
    <Dialog open={createTagDialogOpen} onOpenChange={setCreateTagDialogOpen}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            data-error={!!error}
            variant="outline"
            size="sm"
            className="flex h-8 items-center border-dashed px-2 data-[error=true]:border-red-400 data-[error=true]:bg-red-50"
          >
            <Tag className="mr-2 h-3 w-3" />
            <span className="text-xs">Tags</span>

            {!!error && (
              <span className="ml-2 text-xs font-normal">{error}</span>
            )}

            {value.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <div className="flex gap-1">
                  {value.length > previewTagsAmount ? (
                    <Badge
                      variant="secondary"
                      className="pointer-events-none rounded-sm px-1 font-normal"
                    >
                      {value.length} selected
                    </Badge>
                  ) : (
                    value.map((tag) => (
                      <Badge
                        variant="secondary"
                        key={tag}
                        className="pointer-events-none rounded-sm px-1 font-normal"
                      >
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tags"
              onValueChange={setSearch}
              value={search}
            />

            <CommandList>
              <ScrollArea className="h-[240px] w-full">
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setCreateTagDialogOpen(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-3 w-3" />
                    Create new
                  </CommandItem>
                  {isLoadingTagOptions ? (
                    <div className="flex cursor-default select-none items-center justify-center gap-2 rounded-sm p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Loading tags...</span>
                    </div>
                  ) : tagOptions.length === 0 ? (
                    <div className="flex cursor-default select-none items-center justify-center gap-2 rounded-sm p-2 text-sm text-muted-foreground">
                      No tags found.
                    </div>
                  ) : (
                    tagOptions.map((option: any) => {
                      const isSelected = value.includes(option.slug)

                      return (
                        <CommandItem
                          key={option.id}
                          value={option.id}
                          onSelect={() => {
                            if (isSelected) {
                              handleRemoveTag(option.slug)
                            } else {
                              handleAddTag(option.slug)
                            }
                          }}
                        >
                          <div
                            className={twMerge(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50 [&_svg]:invisible',
                            )}
                          >
                            <CheckIcon className={twMerge('h-4 w-4')} />
                          </div>
                          <span>{option.slug}</span>
                        </CommandItem>
                      )
                    })
                  )}
                </CommandGroup>
              </ScrollArea>
            </CommandList>

            <div className="border-t">
              <CommandItem
                disabled={value.length === 0}
                onSelect={onApplyToAll}
                className="m-1 justify-center text-center text-sm font-normal"
              >
                Apply to all
              </CommandItem>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateNewTagDialog
        onRequestClose={() => {
          setCreateTagDialogOpen(false)
        }}
      />
    </Dialog>
  )
}
