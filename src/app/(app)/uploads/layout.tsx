import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ReactNode, Suspense } from 'react'

import { CardSkeleton } from '@/components/skeleton/card-skeleton'
import { Storage } from '@/components/summary/storage'
import { TotalCount } from '@/components/summary/total-count'

import { UploadsFilters } from './uploads-filters'

dayjs.extend(relativeTime)

export default async function Layout({ children }: { children: ReactNode }) {
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

      <div className="space-y-4">
        <Suspense fallback={null}>
          <UploadsFilters />
        </Suspense>

        {children}
      </div>
    </>
  )
}
