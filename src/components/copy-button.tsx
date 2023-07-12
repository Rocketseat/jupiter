'use client'

import { ComponentProps, useRef, useState } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export interface CopyButtonProps extends ComponentProps<typeof Button> {
  textToCopy: string
}

export function CopyButton({ textToCopy, ...props }: CopyButtonProps) {
  const [wasCopiedRecently, setWasCopiedRecently] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout>()

  function handleCopy() {
    clearTimeout(copyTimeoutRef.current)

    navigator.clipboard.writeText(textToCopy)

    setWasCopiedRecently(true)

    copyTimeoutRef.current = setTimeout(() => {
      setWasCopiedRecently(false)
    }, 2000)
  }

  return (
    <Button
      {...props}
      data-highlight={wasCopiedRecently}
      onClick={handleCopy}
      className={cn(
        props.className,
        'data-[highlight=true]:border-emerald-500 data-[highlight=true]:bg-emerald-500 data-[highlight=true]:text-white data-[highlight=true]:transition-none',
      )}
    >
      {wasCopiedRecently ? 'Copied!' : props.children}
    </Button>
  )
}
