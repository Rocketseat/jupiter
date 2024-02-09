'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RouterOutput } from '@nivo/trpc'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { Loader2 } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/react'

import { VideoDescriptionInput } from './video-description-input'
import { VideoTagInput } from './video-tag-input'

interface VideoFormProps {
  video: RouterOutput['getUpload']['video']
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
      tags: video.tags.map((tag) => tag.slug),
      commitUrl: video.commitUrl,
    },
  })

  const { mutateAsync: updateVideo } = trpc.updateUpload.useMutation()

  async function handleSaveVideo({
    title,
    description,
    tags,
    commitUrl,
  }: EditVideoFormSchema) {
    try {
      await updateVideo({
        videoId: video.id,
        title,
        description,
        tags,
        commitUrl,
      })
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
          <Input id="title" {...register('title')} defaultValue={video.title} />
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
          <VideoDescriptionInput
            videoId={video.id}
            defaultValue={video.description ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalProviderId">External Status/ID</Label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-slate-400 has-[input:focus-visible]:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:has-[input:focus-visible]:ring-slate-800">
            <Badge variant="secondary">
              {video.externalStatus || 'waiting'}
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <input
              data-empty={!video.externalProviderId}
              value={video.externalProviderId ?? '(not generated yet)'}
              id="externalProviderId"
              className="h-10 flex-1 bg-transparent py-2 text-sm outline-none"
              readOnly
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commit">
            Commit reference{' '}
            <span className="text-muted-foreground">(synced with Skylab)</span>
          </Label>
          <Input
            id="commit"
            {...register('commitUrl')}
            defaultValue={video.commitUrl ?? ''}
          />
          {errors.commitUrl && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {errors.commitUrl.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button className="w-24" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
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
