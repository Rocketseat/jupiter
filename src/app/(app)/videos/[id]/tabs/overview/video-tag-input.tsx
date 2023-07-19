'use client'

import { useController, useFormContext } from 'react-hook-form'
import { EditVideoFormSchema } from './video-form'
import { TagInput } from '@/components/tag-input'

export function VideoTagInput() {
  const { control } = useFormContext<EditVideoFormSchema>()

  const {
    field,
    fieldState: { error },
  } = useController({
    name: `tags`,
    control,
    defaultValue: [],
  })

  const { value, onChange } = field

  return (
    <TagInput value={value} onValueChange={onChange} error={error?.message} />
  )
}
