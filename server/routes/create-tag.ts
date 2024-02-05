import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { tag } from '@/drizzle/schema'

import { authentication } from './authentication'

export const createTag = new Elysia().use(authentication).post(
  '/tags',
  async ({ body, getCurrentUser }) => {
    const { companyId } = await getCurrentUser()
    const { tag: slug } = body

    await db.insert(tag).values({
      slug,
      companyId,
    })

    return new Response(null, { status: 201 })
  },
  {
    body: t.Object({
      tag: t.String({ minLength: 2 }),
    }),
  },
)
