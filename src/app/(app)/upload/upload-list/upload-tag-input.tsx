'use client'

import { useController, useFieldArray, useFormContext } from 'react-hook-form'
import { UploadsFormSchema } from '.'
import { TagInput } from '@/components/tag-input'
import { useAtomValue } from 'jotai'
import { amountOfUploadsAtom } from '@/state/uploads'

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
