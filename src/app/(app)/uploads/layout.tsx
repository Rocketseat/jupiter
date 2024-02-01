import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ReactNode, Suspense } from 'react'

import { UploadsFilters } from './uploads-filters'

dayjs.extend(relativeTime)

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Uploads</h2>

      <div className="space-y-4">
        <Suspense fallback={null}>
          <UploadsFilters />
        </Suspense>

        {children}
      </div>
    </>
  )
}
