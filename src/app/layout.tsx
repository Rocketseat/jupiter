import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'

import { Toaster } from '@/components/ui/toaster'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import rocketseatIcon from '@/assets/rocketseat-icon.svg'
import { PlusCircledIcon } from '@radix-ui/react-icons'
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
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <div className="flex flex-col">
          <div className="border-b">
            <div className="flex h-16 items-center px-8">
              <Image
                src={rocketseatIcon}
                alt="Rocketseat"
                className="h-6 w-6"
                width={24}
                height={24}
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
                    <PlusCircledIcon className="mr-2 h-4 w-4" />
                    Upload
                  </Link>
                </Button>
                {/* <UserNav /> */}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Providers>{children}</Providers>
          </div>
        </div>

        <Toaster />
      </body>
    </html>
  )
}
