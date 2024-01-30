import { randomUUID } from 'crypto'
import NextAuth from 'next-auth'
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
        id: randomUUID(),
        email: credentials.email,
        name: 'Rocketseat',
        image: 'https://github.com/rocketseat.png',
      }
    }

    throw new Error('Unauthorized.')
  },
})

const handler = NextAuth({
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
  callbacks: {
    async signIn({ account, profile }) {
      const googleProfile = profile as GoogleProfile

      if (account?.provider === 'google') {
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
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
})

export { handler as GET, handler as POST }
