import { relations } from 'drizzle-orm'
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { company } from '.'

export const webhookEventTrigger = z.enum([
  'upload.created',
  'upload.updated',
  'upload.deleted',
  'upload.transcription.created',
  'tag.created',
  'tag.deleted',
])

export type WebhookEventTrigger = z.infer<typeof webhookEventTrigger>

export const companyWebhook = pgTable(
  'company_webhooks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    url: text('url').notNull(),
    triggers: text('events').array().$type<WebhookEventTrigger[]>().notNull(),
  },
  (table) => {
    return {
      companyIdUrlUnique: uniqueIndex().on(table.companyId, table.url),
    }
  },
)

export const companyWebhookRelations = relations(companyWebhook, ({ one }) => ({
  company: one(company, {
    fields: [companyWebhook.companyId],
    references: [company.id],
  }),
}))
