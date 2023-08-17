import { TagInput } from '@/components/tag-input'
import { Input } from '@/components/ui/input'

export interface DataTableFiltersProps {
  titleFilter: string
  onTitleFilterChange: (search: string) => void

  tagsFilter: string[]
  onTagsFilterChange: (tags: string[]) => void
}

export function DataTableFilters({
  titleFilter,
  tagsFilter,
  onTitleFilterChange,
  onTagsFilterChange,
}: DataTableFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Filter videos..."
        className="h-8 w-auto"
        value={titleFilter}
        onChange={(e) => onTitleFilterChange(e.target.value)}
      />

      <TagInput
        value={tagsFilter}
        onValueChange={onTagsFilterChange}
        allowTagCreation={false}
      />
    </div>
  )
}
