'use client'

import { UploadsProvider } from '@/hooks/useUploads'
import { Header } from './header'
import { UploadDropArea } from './upload-drop-area'
import { UploadTable } from './upload-table'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

const uploadsFormSchema = z.object({
  files: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        duration: z.coerce.number().transform(Math.round),
        sizeInBytes: z.coerce.number(),
        tags: z.array(z.string()).min(1, 'At least one tag is required.'),
      }),
    )
    .min(0),
})

export type UploadsFormSchema = z.infer<typeof uploadsFormSchema>

export function UploadList() {
  const { toast } = useToast()
  const router = useRouter()

  const uploadsForm = useForm<UploadsFormSchema>({
    resolver: zodResolver(uploadsFormSchema),
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = uploadsForm

  async function handleCreateUploads(data: UploadsFormSchema) {
    try {
      const response = await axios.post('/api/batches', data)
      const { batchId } = response.data

      router.push(`/upload/batches/${batchId}`)
    } catch {
      toast({
        title: 'Uh oh! Something went wrong.',
        description:
          'An error ocurred while trying to create the upload batch. If the error persists, please contact an administrator.',
        variant: 'destructive',
        action: (
          <ToastAction
            altText="Try again"
            disabled={isSubmitting}
            onClick={handleSubmit(handleCreateUploads)}
          >
            Try again
          </ToastAction>
        ),
      })
    }
  }

  return (
    <FormProvider {...uploadsForm}>
      <UploadsProvider>
        <div className="space-y-4">
          <Header onSubmit={handleSubmit(handleCreateUploads)} />
          <UploadDropArea />
          <UploadTable />
        </div>
      </UploadsProvider>
    </FormProvider>
  )
}
