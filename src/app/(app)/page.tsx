import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Dashboard`,
}

export default async function Dashboard() {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="truncate text-3xl font-bold tracking-tight">Dashboard</h2>
    </div>
  )
}
