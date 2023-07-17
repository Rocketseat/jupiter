import { Button } from '@/components/ui/button'

import { VideoIcon } from '@radix-ui/react-icons'
import { Music2 } from 'lucide-react'
import { Metadata } from 'next'
import { DeleteVideoButton } from './delete-video-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Overview } from './tabs/overview'
import { Webhooks } from './tabs/webhooks'

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

export const dynamic = 'force-dynamic'

export default async function VideoPage({ params }: VideoPageProps) {
  const videoId = params.id

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="truncate text-3xl font-bold tracking-tight">
          Edit video
        </h2>

        <div className="flex items-center gap-2">
          <DeleteVideoButton videoId={videoId} />

          <Button variant="secondary" asChild>
            <a
              href={`/api/videos/${videoId}/download/video`}
              target="_blank"
              rel="noreferrer"
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              <span>Download MP4</span>
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a
              href={`/api/videos/${videoId}/download/audio`}
              target="_blank"
              rel="noreferrer"
            >
              <Music2 className="mr-2 h-4 w-4" />
              <span>Download MP3</span>
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview videoId={videoId} />
        </TabsContent>
        <TabsContent value="webhooks">
          <Webhooks videoId={videoId} />
        </TabsContent>
      </Tabs>
    </>
  )
}
