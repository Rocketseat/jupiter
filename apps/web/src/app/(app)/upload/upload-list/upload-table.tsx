'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { AudioWaveform, Loader2, TrashIcon, Videotape } from 'lucide-react'
import { SyntheticEvent, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  areUploadsEmptyAtom,
  deleteUploadAtom,
  isRunningAIGenerationAtom,
  isThereAnyPendingUploadAtom,
  updateUploadDurationAtom,
  uploadsAtom,
} from '@/state/uploads'
import { formatBytes } from '@/utils/format-bytes'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'

import { UploadsFormSchema } from '.'
import { AudioConversionProgressColumn } from './columns/audio-conversion-progress-column'
import { AudioUploadProgressColumn } from './columns/audio-upload-progress-column'
import { VideoUploadProgressColumn } from './columns/video-upload-progress-column'
import { UploadLanguageInput } from './upload-language-input'
import { UploadTagInput } from './upload-tag-input'

export function UploadTable() {
  const {
    register,
    formState: { errors },
  } = useFormContext<UploadsFormSchema>()

  const areUploadsEmpty = useAtomValue(areUploadsEmptyAtom)
  const isThereAnyPendingUpload = useAtomValue(isThereAnyPendingUploadAtom)
  const uploads = useAtomValue(uploadsAtom)
  const isRunningAI = useAtomValue(isRunningAIGenerationAtom)

  const updateDuration = useSetAtom(updateUploadDurationAtom)
  const deleteUpload = useSetAtom(deleteUploadAtom)

  /**
   * Intercept window closing when there is any upload in progress
   */
  useEffect(() => {
    if (isThereAnyPendingUpload) {
      window.onbeforeunload = function () {
        return 'You have pending uploads. Do you really want to exit and cancel ALL uploads?'
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 148 }}></TableHead>
            <TableHead>Information</TableHead>
            <TableHead style={{ width: 240 }}>Metadata</TableHead>
            <TableHead style={{ width: 160 }}>
              <div className="flex items-center gap-2">
                <Videotape className="size-4" />
                Upload
              </div>
            </TableHead>
            <TableHead style={{ width: 160 }}>
              <div className="flex items-center gap-2">
                <AudioWaveform className="size-4" />
                Conversion
              </div>
            </TableHead>
            <TableHead style={{ width: 160 }}>
              <div className="flex items-center gap-2">
                <AudioWaveform className="size-4" />
                Upload
              </div>
            </TableHead>
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
                    <div className="flex gap-2">
                      <UploadLanguageInput uploadIndex={index} />
                      <UploadTagInput uploadIndex={index} />
                    </div>
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
                  <VideoUploadProgressColumn uploadId={id} />
                </TableCell>
                <TableCell>
                  <AudioConversionProgressColumn uploadId={id} />
                </TableCell>
                <TableCell>
                  <AudioUploadProgressColumn uploadId={id} />
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
