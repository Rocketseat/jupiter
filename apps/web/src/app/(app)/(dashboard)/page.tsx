import { Metadata } from 'next'
import { Suspense } from 'react'

import { Loading } from '@/components/summary/loading'
import { Storage } from '@/components/summary/storage'
import { TotalCount } from '@/components/summary/total-count'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export const revalidate = 900

export default function DashboardPage() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<Loading />}>
          <TotalCount />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <Storage />
        </Suspense>
      </div>
    </>
  )
}
