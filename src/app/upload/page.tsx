import { Metadata } from 'next'
import { UploadList } from './upload-list'

export const metadata: Metadata = {
  title: 'Upload',
  description: 'Upload new videos.',
}

export default async function Upload() {
  return <UploadList />
}
