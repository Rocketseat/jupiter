'use client'

import { useCompletion } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MagicWandIcon } from '@radix-ui/react-icons'
import { ComponentPropsWithoutRef } from 'react'
import { Loader2 } from 'lucide-react'

export interface VideoDescriptionInputProps
  extends ComponentPropsWithoutRef<'textarea'> {
  videoId: string
}

export function VideoDescriptionInput({
  videoId,
  ...props
}: VideoDescriptionInputProps) {
  const { completion, complete, isLoading } = useCompletion({
    api: `/api/ai/generate/description?videoId=${videoId}`,
  })

  return (
    <>
      <Textarea
        disabled={isLoading}
        className="min-h-[160px] leading-relaxed"
        value={completion}
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
