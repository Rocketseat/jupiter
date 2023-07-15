import { Button } from '@/components/ui/button'

import { prisma } from '@/lib/prisma'
import { GitHubLogoIcon, MagicWandIcon, VideoIcon } from '@radix-ui/react-icons'
import { Loader2, Music2, Save } from 'lucide-react'
import { Metadata } from 'next'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { DeleteVideoButton } from './delete-video-button'
import { TranscriptionCard } from './transcription-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { VideoTagInput } from './video-tag-input'
import { VideoDescriptionInput } from './video-description-input'

dayjs.extend(relativeTime)

interface VideoPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const id = params.id

  return {
    title: `Video ${id}`,
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const videoId = params.id

  const video = await prisma.video.findFirstOrThrow({
    where: {
      id: videoId,
    },
  })

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="truncate text-3xl font-bold tracking-tight">
          {video.title}
        </h2>

        <div className="flex items-center gap-2">
          <DeleteVideoButton videoId={videoId} />

          <Button variant="secondary" asChild>
            <a
              href={`/api/videos/${video.id}/download/video`}
              target="_blank"
              rel="noreferrer"
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              <span>Download MP4</span>
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a
              href={`/api/videos/${video.id}/download/audio`}
              target="_blank"
              rel="noreferrer"
            >
              <Music2 className="mr-2 h-4 w-4" />
              <span>Download MP3</span>
            </a>
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_minmax(320px,480px)] gap-4">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Edit video</CardTitle>
            <CardDescription>Update video details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title{' '}
                  <span className="text-muted-foreground">
                    (synced with Skylab)
                  </span>
                </Label>
                <Input defaultValue={video.title} id="title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{' '}
                  <span className="text-muted-foreground">
                    (synced with Skylab)
                  </span>
                </Label>
                <VideoDescriptionInput
                  videoId={video.id}
                  id="description"
                  defaultValue={video?.description ?? ''}
                />
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
                <div className="flex items-center gap-2">
                  <Input id="commit" className="flex-1" />
                  <Button variant="secondary">
                    <GitHubLogoIcon className="mr-2 h-3 w-3" />
                    Connect Github
                  </Button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Link to Github commit of this lesson with the file diff
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commit">Tags</Label>
                <VideoTagInput />
              </div>

              <Button type="submit">Save video</Button>
            </form>
          </CardContent>
        </Card>
        <TranscriptionCard videoId={video.id} />
      </div>
    </>
  )
}
