import { Metadata } from 'next'

import { Storage } from '@/components/summary/storage'
import { TotalCount } from '@/components/summary/total-count'
import { ViewsCount } from '@/components/summary/views-count'
import { env } from '@/env'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Example dashboard app using the components.',
}

// 15 minutes
export const revalidate = 900

export default function DashboardPage() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <TotalCount />
        <Storage />
      </div>
      <div className="grid grid-cols-1">
        {env.PANDAVIDEO_API_KEY && <ViewsCount />}
      </div>
    </>
  )
}
