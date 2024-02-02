import { unstable_noStore } from 'next/cache'
import { headers } from 'next/headers'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api } from '@/lib/eden'

import { TranscriptionCard } from '../../transcription-card'
import { VideoForm } from './video-form'

export interface OverviewProps {
  videoId: string
}

export async function Overview({ videoId }: OverviewProps) {
  unstable_noStore()

  const { data, error } = await api.videos[videoId].get({
    $fetch: {
      headers: Object.fromEntries(headers().entries()),
    },
  })

  if (error) {
    throw error
  }

  const { video } = data

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
