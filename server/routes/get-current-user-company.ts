import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'

import { authentication } from './authentication'

export const getCurrentUserCompany = new Elysia()
  .use(authentication)
  .get('/me/company', async ({ getCurrentUser }) => {
    const { companyId } = await getCurrentUser()

    const company = await db.query.company.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, companyId)
      },
      with: {
        members: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!company) {
      throw new Error('Company not found.')
    }

    return { company }
  })
