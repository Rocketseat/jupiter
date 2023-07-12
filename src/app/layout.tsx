import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/toaster'

import Providers from './providers'
import { Header } from '@/components/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Jupiter',
    absolute: 'Jupiter',
  },
  description: 'Upload videos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <div className="flex flex-col">
          <Header />
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Providers>{children}</Providers>
          </div>
        </div>

        <Toaster />
      </body>
    </html>
  )
}
