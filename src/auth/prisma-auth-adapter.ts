import { Adapter, AdapterUser } from '@auth/core/adapters'
import { PrismaClient } from '@prisma/client/edge'

const prisma = new PrismaClient()

export const prismaAdapter: Adapter = {
  async createUser(userToCreate): Promise<AdapterUser> {
    const { name, email, image } = userToCreate
    const [, domain] = email.split('@')

    const company = await prisma.company.findUniqueOrThrow({
      where: {
        domain,
      },
    })

    return await prisma.user.create({
      data: {
        name,
        email,
        image,
        companyId: company.id,
        emailVerified: new Date(),
      },
    })
  },

  async getUser(id) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    return user
  },

  async getUserByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    return user
  },

  async getUserByAccount({ providerAccountId, provider }) {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    })

    if (!account) {
      return null
    }

    const { user } = account

    return user
  },

  async updateUser(userToUpdate) {
    const { id, name, email, image } = userToUpdate

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        image,
      },
    })

    return user
  },

  async linkAccount(account) {
    await prisma.account.create({
      data: {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refreshToken: account.refresh_token,
        accessToken: account.access_token,
        expiresAt: account.expires_at,
        tokenType: account.token_type,
        scope: account.scope,
        idToken: account.id_token,
        sessionState: account.session_state?.toString(),
      },
    })
  },

  async createSession({ sessionToken, userId, expires }) {
    const session = await prisma.session.create({
      data: {
        userId,
        expires,
        sessionToken,
      },
    })

    return session
  },

  async getSessionAndUser(sessionToken) {
    const prismaSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: true,
      },
    })

    if (!prismaSession) {
      return null
    }

    const { user, ...session } = prismaSession

    return { user, session }
  },

  async updateSession({ sessionToken, userId, expires }) {
    const session = await prisma.session.update({
      where: { sessionToken },
      data: {
        expires,
        userId,
      },
    })

    return session
  },

  async deleteSession(sessionToken) {
    await prisma.session.delete({
      where: { sessionToken },
    })
  },
}
