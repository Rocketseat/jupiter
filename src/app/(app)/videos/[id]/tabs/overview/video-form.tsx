'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VideoDescriptionInput } from './video-description-input'
import { VideoTagInput } from './video-tag-input'
import { Button } from '@/components/ui/button'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface VideoFormProps {
  video: any
}

const editVideoFormSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()).min(1, {
    message: 'At least one tag is required.',
  }),
})

export type EditVideoFormSchema = z.infer<typeof editVideoFormSchema>

export function VideoForm({ video }: VideoFormProps) {
  const editVideoForm = useForm<EditVideoFormSchema>({
    resolver: zodResolver(editVideoFormSchema),
    defaultValues: {
      title: video.title,
      description: video.description,
    },
  })

  function handleSaveVideo(data: EditVideoFormSchema) {
    console.log(data)
  }

  const { handleSubmit, register } = editVideoForm

  return (
    <FormProvider {...editVideoForm}>
      <form onSubmit={handleSubmit(handleSaveVideo)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title{' '}
            <span className="text-muted-foreground">(synced with Skylab)</span>
          </Label>
          <Input id="title" {...register('title')} />
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
          <Label htmlFor="commit">Commit reference</Label>
          <Input id="commit" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The commit reference will help us finding typos inside the video
            transcription
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commit">Tags</Label>
          <VideoTagInput />
        </div>

        <Button type="submit">Save video</Button>
      </form>
    </FormProvider>
  )
}
