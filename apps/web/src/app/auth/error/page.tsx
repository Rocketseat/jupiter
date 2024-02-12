import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import nivoIcon from '@/assets/nivo-icon.svg'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Access denied',
}

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-8">
          <Image
            src={nivoIcon}
            alt="Nivo"
            className="size-12"
            width={48}
            height={48}
          />

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Access denied!
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              It looks like an error has ocurred while you were trying to
              authenticate.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Only <strong>invited members</strong> can sign in to Nivo.
            </p>
          </div>
          <Button asChild variant="outline" type="button" className="w-full">
            <Link href="/auth/sign-in">
              Try again
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
