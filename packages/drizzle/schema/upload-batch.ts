import { relations } from 'drizzle-orm'
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { company, user, upload } from '.'

export const uploadBatch = pgTable('UploadBatch', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  authorId: uuid('authorId').references(() => user.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  companyId: uuid('companyId')
    .notNull()
    .references(() => company.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
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
