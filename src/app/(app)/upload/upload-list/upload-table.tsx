'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatBytes } from '@/utils/format-bytes'
import {
  DotsHorizontalIcon,
  CrossCircledIcon,
  CheckCircledIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons'
import { Loader2, TrashIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { SyntheticEvent, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { UploadsFormSchema } from '.'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UploadTagInput } from './upload-tag-input'
import { useAtomValue, useSetAtom } from 'jotai'

import {
  areUploadsEmptyAtom,
  deleteUploadAtom,
  isThereAnyPendingUploadAtom,
  startAudioUploadAtom,
  startUploadAtom,
  updateUploadDurationAtom,
  uploadsAtom,
} from '@/state/uploads'

export function UploadTable() {
  const {
    register,
    formState: { errors },
  } = useFormContext<UploadsFormSchema>()

  const areUploadsEmpty = useAtomValue(areUploadsEmptyAtom)
  const isThereAnyPendingUpload = useAtomValue(isThereAnyPendingUploadAtom)
  const uploads = useAtomValue(uploadsAtom)

  const updateDuration = useSetAtom(updateUploadDurationAtom)
  const startUpload = useSetAtom(startUploadAtom)
  const startAudioUpload = useSetAtom(startAudioUploadAtom)
  const deleteUpload = useSetAtom(deleteUploadAtom)

  /**
   * Intercept window closing when there is any upload in progress
   */
  useEffect(() => {
    if (isThereAnyPendingUpload) {
      window.onbeforeunload = function () {
        return 'Você possui uploads pendentes. Deseja realmente sair e cancelar TODOS uploads?'
      }
    } else {
      window.onbeforeunload = null
    }
  }, [isThereAnyPendingUpload])

  function handleLoadedMetadata(
    event: SyntheticEvent<HTMLVideoElement>,
    id: string,
  ) {
    updateDuration(id, event.currentTarget.duration)
  }

  const isRunningAI = false

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 148 }}></TableHead>
            <TableHead>Title</TableHead>
            <TableHead style={{ width: 180 }}>Metadata</TableHead>
            <TableHead style={{ width: 200 }}>Video upload</TableHead>
            <TableHead style={{ width: 200 }}>Audio conversion</TableHead>
            <TableHead style={{ width: 200 }}>Audio upload</TableHead>
            <TableHead style={{ width: 140 }}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(uploads).map(([id, upload], index) => {
            return (
              <TableRow key={id}>
                <TableCell>
                  <video
                    src={upload.previewURL}
                    controls={false}
                    className="pointer-events-none aspect-video rounded-md"
                    preload="metadata"
                    onLoadedMetadata={(event) =>
                      handleLoadedMetadata(event, id)
                    }
                  />
                </TableCell>
                <TableCell style={{ width: 600 }}>
                  <div className="flex max-w-[420px] flex-col items-start gap-1">
                    <input
                      type="hidden"
                      value={id}
                      {...register(`files.${index}.id`)}
                    />
                    <Input
                      data-error={!!errors.files?.[index]?.title}
                      defaultValue={upload.file.name}
                      className="h-8 data-[error=true]:border-red-400"
                      disabled={isRunningAI}
                      {...register(`files.${index}.title`)}
                    />
                    <UploadTagInput uploadIndex={index} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="truncate">{upload.file.name}</span>
                    <span className="font-medium">
                      {formatBytes(upload.file.size)} -{' '}
                      {upload.duration
                        ? formatSecondsToMinutes(upload.duration)
                        : null}
                    </span>
                  </div>

                  <input
                    type="hidden"
                    value={upload.file.size}
                    {...register(`files.${index}.sizeInBytes`)}
                  />

                  {upload.duration && (
                    <input
                      type="hidden"
                      value={upload.duration}
                      {...register(`files.${index}.duration`)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {upload.isUploadingVideo ? (
                    <Progress
                      max={100}
                      value={upload.videoUploadProgress}
                      className="transition-all"
                    />
                  ) : (
                    <div className="flex items-center font-medium">
                      {upload.videoUploadProgress === 0 &&
                      !upload.hasVideoUploadError ? (
                        <>
                          <DotsHorizontalIcon className="mr-2 h-4 w-4" />
                          <span className="text-muted-foreground">
                            Waiting upload
                          </span>
                        </>
                      ) : upload.hasVideoUploadError ? (
                        <>
                          <CrossCircledIcon className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-500">
                            Upload error{' '}
                            <Button
                              variant="link"
                              className="inline p-0 text-inherit"
                              onClick={() => startUpload(id)}
                            >
                              (Retry)
                            </Button>
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircledIcon className="mr-2 h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-500">
                            Upload complete
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-muted-foreground">
                    {upload.isConvertingAudio ? (
                      <Progress
                        max={100}
                        value={upload.audioConversionProgress}
                        className="transition-all"
                      />
                    ) : upload.audioConversionProgress === 100 ? (
                      <>
                        <CheckCircledIcon className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-500">
                          Conversion complete
                        </span>
                      </>
                    ) : (
                      <>
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="text-muted-foreground">
                          Waiting on queue
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircledIcon className="h-4 w-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[280px]">
                              <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                                As we perform the audio conversion in the
                                browser, each video is converted individually
                                through a queue.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {upload.isUploadingAudio ? (
                    <Progress
                      max={100}
                      value={upload.audioUploadProgress}
                      className="transition-all"
                    />
                  ) : (
                    <div className="flex items-center font-medium">
                      {upload.audioUploadProgress === 0 &&
                      !upload.hasAudioUploadError ? (
                        <>
                          <DotsHorizontalIcon className="mr-2 h-4 w-4" />
                          <span className="text-muted-foreground">
                            Waiting upload
                          </span>
                        </>
                      ) : upload.hasAudioUploadError ? (
                        <>
                          <CrossCircledIcon className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-500">
                            Upload error{' '}
                            <Button
                              variant="link"
                              className="inline p-0 text-inherit"
                              onClick={() => startAudioUpload(id)}
                            >
                              (Retry)
                            </Button>
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircledIcon className="mr-2 h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-500">
                            Upload complete
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => deleteUpload(id)}
                    size="sm"
                    variant="destructive"
                    disabled={upload.isRemoving}
                  >
                    {upload.isRemoving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}

          {areUploadsEmpty && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No videos selected.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
