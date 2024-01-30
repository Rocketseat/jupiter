import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/toaster'

import Providers from './providers'

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
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}

          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
