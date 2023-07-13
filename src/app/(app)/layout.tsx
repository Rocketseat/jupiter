import { Header } from '@/components/header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
    </div>
  )
}
