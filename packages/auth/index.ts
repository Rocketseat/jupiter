import './next-auth-extend.d'

import NextAuth from 'next-auth'

import { authConfig } from './auth.config'

export type { Session, User } from 'next-auth'

export const {
  auth,
  signIn,
  signOut,
  unstable_update: update,
  handlers,
} = NextAuth(authConfig)
