import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'

import { env } from '@/env'

const credentialsProvider = CredentialsProvider({
  credentials: {
    email: {
      label: 'E-mail',
      type: 'email',
      placeholder: 'use admin@rocketseat.team',
      value: 'admin@rocketseat.team',
    },
    password: {
      label: 'Password',
      type: 'password',
      value: 'admin',
      placeholder: 'use 123456',
    },
  },
  async authorize(credentials) {
    if (
      credentials?.email === 'admin@rocketseat.team' &&
      credentials.password === '123456'
    ) {
      return {
        id: crypto.randomUUID(),
        email: credentials.email,
        name: 'Rocketseat',
        image: 'https://github.com/rocketseat.png',
      }
    }

    throw new Error('Unauthorized.')
  },
})

export const authConfig = {
  providers: [
    env.VERCEL_ENV === 'preview'
      ? credentialsProvider
      : GoogleProvider({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: 'consent',
              access_type: 'offline',
              response_type: 'code',
            },
          },
        }),
  ],
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        const googleProfile = profile as GoogleProfile
        const emailDomain = googleProfile.email.match(/@([^@]+)$/)

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
