import { PrismaClient } from '@prisma/client'

import { env } from '@/env'

let prisma: PrismaClient

if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-expect-error GlobalPrisma
  if (!global.prisma) {
    // @ts-expect-error GlobalPrisma
    global.prisma = new PrismaClient()
  }

  // @ts-expect-error GlobalPrisma
  prisma = global.prisma
}

export { prisma }
