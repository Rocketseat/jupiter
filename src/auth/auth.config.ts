import type { NextAuthConfig } from 'next-auth'
import { GoogleProfile } from 'next-auth/providers/google'

import { env } from '@/env'

import { credentialsProvider } from './credentials-provider'
import { googleProvider } from './google-provider'

export const authConfig = {
  providers:
    env.VERCEL_ENV === 'preview' ? [credentialsProvider] : [googleProvider],
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        const googleProfile = profile as GoogleProfile
        const emailDomain = googleProfile.email.match(/@([^@]+)$/)

        console.log(emailDomain)

        if (!emailDomain) {
          return false
        }

        return (
          googleProfile.email_verified &&
          ['@rocketseat.team', '@digitalhouse.com'].includes(emailDomain[0])
        )
      } else if (account?.provider === 'credentials') {
        return true
      }

      return false
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      const isOnPublicPages = nextUrl.pathname.startsWith('/auth')
      const isOnWebhooks = nextUrl.pathname.startsWith('/api/webhooks')
      const isOnPublicAPIRoutes = nextUrl.pathname.startsWith('/api/auth')
      const isOnAPIRoutes = nextUrl.pathname.startsWith('/api')
      const isOnPrivatePages = !isOnPublicPages

      if (isOnWebhooks || isOnPublicAPIRoutes) {
        return true
      }

      if (isOnPublicPages && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl))
      }

      if (isOnAPIRoutes && !isLoggedIn) {
        return Response.json({ message: 'Unauthorized.' }, { status: 401 })
      }

      if (isOnPrivatePages && !isLoggedIn) {
        // Redirect user back to sign in
        return false
      }

      return true
    },
  },
} satisfies NextAuthConfig
