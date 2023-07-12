'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@radix-ui/react-icons'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Command,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'
import { useController, useFormContext } from 'react-hook-form'
import { UploadsFormSchema } from '.'
import { useUploads } from '@/hooks/useUploads'

const options = [
  'ignite',
  'node',
  'react',
  'react-native',
  'explorer',
  'plus',
  'node-ddd',
]

interface TagInputProps {
  uploadIndex: number
}

export function TagInput({ uploadIndex }: TagInputProps) {
  const { uploads } = useUploads()
  const { control, setValue } = useFormContext<UploadsFormSchema>()

  const {
    field,
    fieldState: { error },
  } = useController({
    name: `files.${uploadIndex}.tags`,
    control,
    defaultValue: [],
  })

  const { value: tags, onChange } = field

  function handleAddTag(tag: string) {
    onChange([...tags, tag])
  }

  function handleRemoveTag(tag: string) {
    onChange(tags.filter((item) => item !== tag))
  }

  function handleApplyToAllUploads() {
    Array.from(uploads.entries()).forEach((_, index) => {
      setValue(`files.${index}.tags`, tags, {
        shouldValidate: true,
      })
    })
  }

  return (
    <Popover>
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
            <span className="ml-2 text-xs font-normal">{error.message}</span>
          )}

          {tags.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="flex gap-1">
                {tags.length > 5 ? (
                  <Badge
                    variant="secondary"
                    className="pointer-events-none rounded-sm px-1 font-normal"
                  >
                    {tags.length} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => tags.includes(option))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option}
                        className="pointer-events-none rounded-sm px-1 font-normal"
                      >
                        {option}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tags" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = tags.includes(option)

                return (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      if (isSelected) {
                        handleRemoveTag(option)
                      } else {
                        handleAddTag(option)
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4')} />
                    </div>
                    <span>{option}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {tags.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleApplyToAllUploads}
                    className="justify-center text-center"
                  >
                    Apply to all uploads ({uploads.size})
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
