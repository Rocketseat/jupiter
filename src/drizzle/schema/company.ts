import { relations } from 'drizzle-orm'
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { tag, uploadBatch, user, video } from '.'

export const company = pgTable(
  'Company',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    domain: text('domain').notNull(),
    webhookUrl: text('webhookUrl'),
    externalId: text('externalId'),
  },
  (table) => {
    return {
      domainKey: uniqueIndex('Company_domain_key').on(table.domain),
    }
  },
)

export const companyRelations = relations(company, ({ many }) => ({
  videos: many(video),
  members: many(user),
  uploadBatches: many(uploadBatch),
  tags: many(tag),
}))
