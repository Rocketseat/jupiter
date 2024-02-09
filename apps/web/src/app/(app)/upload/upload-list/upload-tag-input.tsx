'use client'

import { useAtomValue } from 'jotai'
import { useController, useFormContext } from 'react-hook-form'

import { TagInput } from '@/components/tag-input'
import { amountOfUploadsAtom } from '@/state/uploads'

import { UploadsFormSchema } from '.'

interface TagInputProps {
  uploadIndex: number
}

export function UploadTagInput({ uploadIndex }: TagInputProps) {
  const { control, setValue } = useFormContext<UploadsFormSchema>()
  const amountOfUploads = useAtomValue(amountOfUploadsAtom)

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
    Array.from({ length: amountOfUploads }).forEach((_, index) => {
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
