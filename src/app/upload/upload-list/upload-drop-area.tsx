'use client'

import { useUploads } from '@/hooks/useUploads'
import { UploadIcon } from '@radix-ui/react-icons'
import { useDropzone } from 'react-dropzone'

export function UploadDropArea() {
  const { add } = useUploads()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/mp4': ['.mp4'],
    },
    multiple: true,
    onDrop: add,
  })

  return (
    <>
      <label
        htmlFor="files"
        className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 p-4 text-sm text-slate-600 hover:bg-slate-100 data-[drag-active=true]:border-violet-300 data-[drag-active=true]:bg-violet-50 dark:bg-slate-900 dark:text-slate-400"
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
