import { Metadata } from 'next'
import { BatchVideoList } from './batch-video-list'

interface BatchPageProps { 
  params: { id: string } 
}

export async function generateMetadata({
  params,
}: BatchPageProps): Promise<Metadata> {
  const id = params.id

  return {
    title: `Batch ${id}`,
  }
}

export default async function BatchPage({ params }: BatchPageProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Batch details
        </h2>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            This page refreshes every 15s
          </span>
        </div>
      </div>

      <BatchVideoList batchId={params.id} />
    </>
  )
}
