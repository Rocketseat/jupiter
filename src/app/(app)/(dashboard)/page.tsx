import { Metadata } from 'next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { Storage } from '@/components/summary/storage'
import { TotalCount } from '@/components/summary/total-count'
import { ViewsCount } from '@/components/summary/views-count'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Example dashboard app using the components.',
}

export default function DashboardPage() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <TotalCount />
        <Storage />
      </div>
      <div className="grid grid-cols-1">
        <ViewsCount />
      </div>
    </>
  )
}
