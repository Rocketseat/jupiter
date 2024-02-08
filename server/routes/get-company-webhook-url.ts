import { Elysia } from 'elysia'

import { db } from '@/drizzle/client'

import { authentication } from './authentication'

export const getCompanyWebhookUrl = new Elysia()
  .use(authentication)
  .get('/company/webhook-url', async ({ getCurrentUser }) => {
    const { companyId } = await getCurrentUser()

    const company = await db.query.company.findFirst({
      columns: {
        webhookUrl: true,
      },
      where(fields, { eq }) {
        return eq(fields.id, companyId)
      },
    })

    if (!company) {
      throw new Error('Company not found.')
    }

    return { url: company.webhookUrl }
  })
