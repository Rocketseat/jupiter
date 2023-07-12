import { Metadata } from 'next'
import { VideoList } from './video-list'

export const metadata: Metadata = {
  title: 'Uploads',
}

export default async function UploadsPage() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Uploads</h2>

      <VideoList />
    </>
  )
}
