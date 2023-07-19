'use client'

import { useController, useFormContext } from 'react-hook-form'
import { UploadsFormSchema } from '.'
import { useUploads } from '@/hooks/useUploads'
import { TagInput } from '@/components/tag-input'

interface TagInputProps {
  uploadIndex: number
}

export function UploadTagInput({ uploadIndex }: TagInputProps) {
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

  const { value, onChange } = field

  function handleApplyToAllUploads() {
    Array.from(uploads.entries()).forEach((_, index) => {
      setValue(`files.${index}.tags`, value, {
        shouldValidate: true,
      })
    })
  }

  return (
    <TagInput
      value={value}
      onValueChange={onChange}
      previewTagsAmount={3}
      error={error?.message}
      onApplyToAll={handleApplyToAllUploads}
    />
  )
}
