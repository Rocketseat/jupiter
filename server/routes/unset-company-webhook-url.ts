import { eq } from 'drizzle-orm'
import { Elysia } from 'elysia'

import { db } from '@/drizzle/client'
import { company } from '@/drizzle/schema'

import { authentication } from './authentication'

export const unsetCompanyWebhookUrl = new Elysia()
  .use(authentication)
  .delete('/company/webhook-url', async ({ getCurrentUser }) => {
    const { companyId } = await getCurrentUser()

    await db
      .update(company)
      .set({
        webhookUrl: null,
      })
      .where(eq(company.id, companyId))

    return new Response(null, { status: 204 })
  })
