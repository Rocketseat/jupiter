import { eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { company } from '@/drizzle/schema'

import { authentication } from './authentication'

export const setCompanyWebhookUrl = new Elysia().use(authentication).patch(
  '/company/webhook-url',
  async ({ getCurrentUser, body }) => {
    const { companyId } = await getCurrentUser()
    const { url } = body

    await db
      .update(company)
      .set({
        webhookUrl: url,
      })
      .where(eq(company.id, companyId))

    return new Response(null, { status: 204 })
  },
  {
    body: t.Object({
      url: t.String(),
    }),
  },
)
