import { Button } from '@/components/ui/button'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

import rocketseatIcon from '@/assets/rocketseat-icon.svg'

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
          <div className="border-b">
            <div className="flex h-16 items-center px-8">
              <Image
                src={rocketseatIcon}
                alt="Rocketseat"
                className="h-6 w-6"
              />

              <nav className="ml-6 flex items-center space-x-4 lg:space-x-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Uploads
                </Link>
                <Link
                  href="/transcriptions"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Transcriptions
                </Link>
                <Link
                  href="/ai"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Search & AI
                </Link>
              </nav>

              <div className="ml-auto flex items-center space-x-4">
                <Input
                  type="search"
                  placeholder="Search content..."
                  className="md:w-[100px] lg:w-[300px]"
                />
                <Button asChild>
                  <Link href="/upload">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New upload
                  </Link>
                </Button>
                {/* <UserNav /> */}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </div>
      </body>
    </html>
  )
}
