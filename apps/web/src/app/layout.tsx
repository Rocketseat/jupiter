import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import { Toaster } from '@/components/ui/toaster'

import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s | Nivo',
    absolute: 'Nivo',
  },
  description: 'The all-in-one video solution for online learning.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}

          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
