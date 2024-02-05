'use client'

import { MagicWandIcon } from '@radix-ui/react-icons'
import { useCompletion } from 'ai/react'
import { Loader2 } from 'lucide-react'
import { ComponentProps, TextareaHTMLAttributes, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { EditVideoFormSchema } from './video-form'

export interface VideoDescriptionInputProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  videoId: string
}

export function VideoDescriptionInput({
  videoId,
  ...props
}: VideoDescriptionInputProps) {
  const { setValue, register } = useFormContext<EditVideoFormSchema>()

  const { completion, complete, isLoading } = useCompletion({
    api: `/api/ai/generate/description?videoId=${videoId}`,
  })

  useEffect(() => {
    if (completion) {
      setValue('description', completion)
    }
  }, [completion, setValue])

  return (
    <>
      <Textarea
        id="description"
        disabled={isLoading}
        className="min-h-[132px] leading-relaxed"
        {...register('description')}
        {...props}
      />
      <div>
        <Button
          disabled={isLoading}
          onClick={() => complete(videoId)}
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <MagicWandIcon className="mr-2 h-3 w-3" />
          )}
          Generate with AI
        </Button>
      </div>
    </>
  )
}
