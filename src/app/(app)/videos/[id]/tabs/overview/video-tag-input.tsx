'use client'

import { useController, useFormContext } from 'react-hook-form'

import { TagInput } from '@/components/tag-input'

import { EditVideoFormSchema } from './video-form'

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
