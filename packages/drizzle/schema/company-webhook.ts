import { relations } from 'drizzle-orm'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { company } from '.'

export const companyWebhook = pgTable('company_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => company.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
  url: text('url').notNull(),
  triggers: text('events').array().$type(),
})

export const companyWebhookRelations = relations(companyWebhook, ({ one }) => ({
  company: one(company, {
    fields: [companyWebhook.companyId],
    references: [company.id],
  }),
}))
