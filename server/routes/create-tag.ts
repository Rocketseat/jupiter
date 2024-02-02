import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { tag } from '@/drizzle/schema'

export const createTag = new Elysia().post(
  '/tags',
  async ({ body }) => {
    const { tag: slug } = body

    await db.insert(tag).values({
      slug,
      companyId: 'ae6780ef-b2c2-4041-bada-c48e27ac6157',
    })

    return new Response(null, { status: 201 })
  },
  {
    body: t.Object({
      tag: t.String({ minLength: 2 }),
    }),
  },
)
