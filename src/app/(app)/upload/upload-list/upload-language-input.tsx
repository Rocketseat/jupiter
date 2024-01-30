import { useController, useFormContext } from 'react-hook-form'

import { FlagAR } from '@/components/flags/flag-ar'
import { FlagBR } from '@/components/flags/flag-br'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { UploadsFormSchema } from '.'

interface UploadLanguageInputProps {
  uploadIndex: number
}

export function UploadLanguageInput({ uploadIndex }: UploadLanguageInputProps) {
  const { control } = useFormContext<UploadsFormSchema>()

  const { field } = useController({
    name: `files.${uploadIndex}.language`,
    control,
    defaultValue: 'pt',
  })

  const { value, onChange } = field

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="flex h-8 gap-2">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pt">
          <div className="flex flex-row items-center gap-2">
            <FlagBR className="h-3 w-3" />
            PT
          </div>
        </SelectItem>
        <SelectItem value="es">
          <div className="flex flex-row items-center gap-2">
            <FlagAR className="h-3 w-3" />
            ES
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
