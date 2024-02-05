import type { NextAuthConfig } from 'next-auth'

import { env } from '@/env'

import { credentialsProvider } from './credentials-provider'
import { drizzleAuthAdapter } from './drizzle-auth-adapter'
import { googleProvider } from './google-provider'

export const authConfig = {
  adapter: drizzleAuthAdapter,
  providers:
    env.VERCEL_ENV === 'preview' ? [credentialsProvider] : [googleProvider],
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.companyId = user.companyId
      }

      return token
    },
    session({ session, ...params }) {
      if ('token' in params && session.user) {
        session.user.companyId = params.token.companyId
      }

      return session
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
