'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc'

import { Header } from './header'
import { UploadDropArea } from './upload-drop-area'
import { UploadTable } from './upload-table'

const uploadsFormSchema = z.object({
  files: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        duration: z.coerce.number().transform(Math.round),
        language: z.string(),
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

  const { mutateAsync: createUploadBatch } =
    trpc.createUploadBatch.useMutation()

  async function handleCreateUploadBatch({ files }: UploadsFormSchema) {
    try {
      const { batchId } = await createUploadBatch({ files })

      router.push(`/batches/${batchId}`)
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
            onClick={handleSubmit(handleCreateUploadBatch)}
          >
            Try again
          </ToastAction>
        ),
      })
    }
  }

  return (
    <FormProvider {...uploadsForm}>
      <div className="space-y-4">
        <Header onSubmit={handleSubmit(handleCreateUploadBatch)} />
        <UploadDropArea />
        <UploadTable />
      </div>
    </FormProvider>
  )
}
