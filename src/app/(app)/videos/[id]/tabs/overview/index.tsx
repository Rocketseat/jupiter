import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { TranscriptionCard } from '../../transcription-card'
import { VideoForm } from './video-form'

export interface OverviewProps {
  videoId: string
}

export async function Overview({ videoId }: OverviewProps) {
  const video = await prisma.video.findFirstOrThrow({
    where: {
      id: videoId,
    },
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
      <TranscriptionCard videoId={videoId} />
    </div>
  )
}
