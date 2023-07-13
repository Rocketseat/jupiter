import { Metadata } from 'next'
import { VideoList } from './video-list'
import { Storage } from './summary/storage'
import { TotalCount } from './summary/total-count'

export const metadata: Metadata = {
  title: 'Uploads',
}

export default async function UploadsPage() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Uploads</h2>

      <div className="grid grid-cols-2 gap-4">
        <TotalCount />
        <Storage />
      </div>

      <VideoList />
    </>
  )
}
