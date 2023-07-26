import { Metadata } from 'next'
import { VideoList } from './video-list'
import { Storage } from '@/components/summary/storage'
import { TotalCount } from '@/components/summary/total-count'
import { Suspense } from 'react'
import { CardSkeleton } from '@/components/skeleton/card-skeleton'

export const metadata: Metadata = {
  title: 'Uploads',
}

export default async function UploadsPage() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Uploads</h2>

      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<CardSkeleton />}>
          <TotalCount />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <Storage />
        </Suspense>
      </div>

      <VideoList />
    </>
  )
}
