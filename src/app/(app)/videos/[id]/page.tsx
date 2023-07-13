import { Button } from '@/components/ui/button'

import { prisma } from '@/lib/prisma'
import { VideoIcon } from '@radix-ui/react-icons'
import { Music2 } from 'lucide-react'
import { Metadata } from 'next'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { DeleteVideoButton } from './delete-video-button'

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
  )
}
