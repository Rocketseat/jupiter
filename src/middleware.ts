import NextAuth from 'next-auth'

import { authConfig } from '@/auth/auth.config'

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  // matcher: ['/none'],
}
