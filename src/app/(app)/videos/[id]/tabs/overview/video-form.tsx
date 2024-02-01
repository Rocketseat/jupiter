'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/eden'

import { VideoDescriptionInput } from './video-description-input'
import { VideoTagInput } from './video-tag-input'

interface VideoFormProps {
  video: any
}

const editVideoFormSchema = z.object({
  title: z.string().min(1, { message: 'Please provide a valid title.' }),
  description: z.string().nullable(),
  commitUrl: z
    .string()
    .url({ message: 'Please provide a valid Github URL.' })
    .nullable(),
  tags: z.array(z.string()).min(1, {
    message: 'At least one tag is required.',
  }),
})

export type EditVideoFormSchema = z.infer<typeof editVideoFormSchema>

export function VideoForm({ video }: VideoFormProps) {
  const { toast } = useToast()

  const editVideoForm = useForm<EditVideoFormSchema>({
    resolver: zodResolver(editVideoFormSchema),
    defaultValues: {
      title: video.title,
      description: video.description,
      tags: video.tags.map((tag: any) => tag.slug),
      commitUrl: video.commitUrl,
    },
  })

  const { mutateAsync: updateVideo } = useMutation({
    mutationFn: async (data: EditVideoFormSchema) => {
      await api.videos[video.id].put(data)
    },
  })

  async function handleSaveVideo(data: EditVideoFormSchema) {
    try {
      await updateVideo(data)
    } catch {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: `An error ocurred while trying to save the video.`,
        variant: 'destructive',
      })
    }
  }

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = editVideoForm

  return (
    <FormProvider {...editVideoForm}>
      <form onSubmit={handleSubmit(handleSaveVideo)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title{' '}
            <span className="text-muted-foreground">(synced with Skylab)</span>
          </Label>
          <Input id="title" {...register('title')} />
          {errors.title && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="commit">Tags</Label>
          <VideoTagInput />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description{' '}
            <span className="text-muted-foreground">(synced with Skylab)</span>
          </Label>
          <VideoDescriptionInput videoId={video.id} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalProviderId">External ID (Panda)</Label>
          <Input
            data-empty={!video.externalProviderId}
            value={video.externalProviderId ?? '(not generated yet)'}
            id="externalProviderId"
            className="data-[empty=true]:italic data-[empty=true]:text-muted-foreground"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commit">
            Commit reference{' '}
            <span className="text-muted-foreground">(synced with Skylab)</span>
          </Label>
          <Input id="commit" {...register('commitUrl')} />
          {errors.commitUrl && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {errors.commitUrl.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button className="w-24" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
          {isSubmitSuccessful && (
            <div className="flex items-center gap-2 text-sm text-emerald-500 dark:text-emerald-400">
              <CheckCircledIcon className="h-3 w-3" />
              <span>Saved!</span>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
