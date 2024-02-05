import { Elysia } from 'elysia'

import { auth } from '@/auth'

import { UnauthorizedError } from './errors/unauthorized-error'

export const authentication = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401
        return { code, message: error.message }
    }
  })
  .derive(() => {
    return {
      getCurrentUser: async () => {
        const session = await auth()

        if (!session) {
          throw new UnauthorizedError()
        }

        return session.user
      },
    }
  })
