import { unstable_noStore } from 'next/cache'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { serverClient } from '@/lib/trpc/server'

import { TranscriptionCard } from '../../transcription-card'
import { VideoForm } from './video-form'

export interface OverviewProps {
  videoId: string
}

export async function Overview({ videoId }: OverviewProps) {
  unstable_noStore()

  const { video } = await serverClient.getUpload({
    videoId,
  })

  return (
    <div className="grid flex-1 grid-cols-[1fr_minmax(320px,480px)] gap-4">
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Edit video</CardTitle>
          <CardDescription>Update video details</CardDescription>
        </CardHeader>
        <CardContent>
          <VideoForm video={video} />
        </CardContent>
      </Card>
      <TranscriptionCard
        videoId={videoId}
        shouldDisplayVideo={!!video.storageKey}
      />
    </div>
  )
}
