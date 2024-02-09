'use client'

import { UploadIcon } from '@radix-ui/react-icons'
import { useSetAtom } from 'jotai'
import { useDropzone } from 'react-dropzone'

import { addUploadsAtom } from '@/state/uploads'

export function UploadDropArea() {
  const addUploads = useSetAtom(addUploadsAtom)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/mp4': ['.mp4'],
    },
    multiple: true,
    onDrop: addUploads,
    maxSize: 524_288_000, // 500mb
  })

  return (
    <>
      <label
        htmlFor="files"
        className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 p-4 text-sm text-slate-600 hover:bg-slate-100 data-[drag-active=true]:border-primary data-[drag-active=true]:bg-primary dark:bg-slate-900 dark:text-slate-400"
        data-drag-active={isDragActive}
        {...getRootProps()}
      >
        <UploadIcon className="h-4 w-4" />
        <div className="flex flex-col gap-1 text-center">
          <span className="font-medium">Drop videos here</span>
          <span className="text-xs text-slate-400">Accept only MP4.</span>
        </div>
      </label>

      <input type="file" id="files" multiple {...getInputProps()} />
    </>
  )
}
