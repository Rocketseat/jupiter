'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  addToAudioConversionQueueAtom,
  audioConversionAtom,
} from '@/state/uploads'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons'
import { useAtomValue, useSetAtom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useCallback } from 'react'

export interface AudioConversionProgressColumnProps {
  uploadId: string
}

export function AudioConversionProgressColumn({
  uploadId,
}: AudioConversionProgressColumnProps) {
  const audioConversion = useAtomValue(
    selectAtom(
      audioConversionAtom,
      useCallback((state) => state.get(uploadId), [uploadId]),
    ),
  )

  const addToAudioConversionQueue = useSetAtom(addToAudioConversionQueueAtom)

  if (!audioConversion) {
    return null
  }

  const { isRunning, progress, error } = audioConversion

  return (
    <div className="flex items-center gap-2 font-medium text-muted-foreground">
      {isRunning ? (
        <Progress value={progress} className="transition-all" />
      ) : error ? (
        <>
          <CrossCircledIcon className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
          <span className="text-red-500 dark:text-red-400">
            Error{' '}
            <Button
              variant="link"
              className="inline p-0 text-inherit dark:text-inherit"
              onClick={() => addToAudioConversionQueue(uploadId)}
            >
              (Retry)
            </Button>
          </span>
        </>
      ) : progress === 100 ? (
        <>
          <CheckCircledIcon className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-500">Complete</span>
        </>
      ) : (
        <>
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="text-muted-foreground">Waiting...</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoCircledIcon className="h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                  As we perform the audio conversion in the browser, each video
                  is converted individually through a queue.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  )
}
