'use client'

import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons'
import { useAtomValue, useSetAtom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { startVideoUploadAtom, videoUploadAtom } from '@/state/uploads'

export interface VideoUploadProgressColumnProps {
  uploadId: string
}

export function VideoUploadProgressColumn({
  uploadId,
}: VideoUploadProgressColumnProps) {
  const videoUpload = useAtomValue(
    selectAtom(
      videoUploadAtom,
      useCallback((state) => state.get(uploadId), [uploadId]),
    ),
  )

  const startVideoUpload = useSetAtom(startVideoUploadAtom)

  if (!videoUpload) {
    return null
  }

  const { isRunning, progress, error } = videoUpload

  return (
    <>
      {isRunning ? (
        <Progress value={progress} className="transition-all" />
      ) : (
        <div className="flex items-center font-medium">
          {progress === 0 && !error ? (
            <>
              <DotsHorizontalIcon className="mr-2 h-4 w-4" />
              <span className="text-muted-foreground">Waiting...</span>
            </>
          ) : error ? (
            <>
              <CrossCircledIcon className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">
                Error{' '}
                <Button
                  variant="link"
                  className="inline p-0 text-inherit"
                  onClick={() => startVideoUpload(uploadId)}
                >
                  (Retry)
                </Button>
              </span>
            </>
          ) : (
            <>
              <CheckCircledIcon className="mr-2 h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">Complete</span>
            </>
          )}
        </div>
      )}
    </>
  )
}
