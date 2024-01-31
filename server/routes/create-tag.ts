import { Elysia, t } from 'elysia'

import { prisma } from '@/lib/prisma'

export const createTag = new Elysia().post(
  '/tags',
  async ({ body }) => {
    const { tag } = body

    await prisma.tag.create({
      data: {
        slug: tag,
      },
    })

    return new Response(null, { status: 201 })
  },
  {
    body: t.Object({
      tag: t.String({ minLength: 2 }),
    }),
  },
)
