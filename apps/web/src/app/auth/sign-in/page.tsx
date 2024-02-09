import { env } from '@nivo/env'
import { Metadata } from 'next'
import Image from 'next/image'

import nivoIcon from '@/assets/nivo-icon.svg'

import { SignInButton } from './sign-in-button'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In',
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
              nivo.video
            </h1>
            <p className="text-sm text-muted-foreground">
              The all-in-one video solution for online learning.
            </p>
          </div>
        </div>
        <div>
          {env.VERCEL_ENV === 'preview' ? <SignInForm /> : <SignInButton />}
        </div>
        <p className="px-8 text-center text-sm leading-relaxed text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <a
            href="https://www.rocketseat.com.br/terms"
            className="underline underline-offset-4 hover:text-primary"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="https://www.rocketseat.com.br/privacy"
            className="underline underline-offset-4 hover:text-primary"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
