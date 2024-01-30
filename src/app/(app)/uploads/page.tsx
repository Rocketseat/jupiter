import { Metadata } from 'next'
import { Suspense } from 'react'

import { CardSkeleton } from '@/components/skeleton/card-skeleton'
import { Storage } from '@/components/summary/storage'
import { TotalCount } from '@/components/summary/total-count'

import { VideoList } from './video-list'

export const metadata: Metadata = {
  title: 'Uploads',
}

// 15 minutes
export const revalidate = 900

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
