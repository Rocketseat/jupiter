import { relations } from 'drizzle-orm'
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { company, upload, user } from '.'

export const uploadBatch = pgTable('upload_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => user.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  companyId: uuid('company_id')
    .notNull()
    .references(() => company.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const uploadBatchRelations = relations(uploadBatch, ({ one, many }) => ({
  company: one(company, {
    fields: [uploadBatch.companyId],
    references: [company.id],
  }),
  author: one(user, {
    fields: [uploadBatch.authorId],
    references: [user.id],
  }),
  uploads: many(upload),
}))
