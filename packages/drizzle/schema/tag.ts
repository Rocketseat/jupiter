import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { company, tagToUpload } from '.'

export const tag = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  (table) => {
    return {
      slugUnique: uniqueIndex().on(table.slug),
    }
  },
)

export const tagRelations = relations(tag, ({ one, many }) => ({
  company: one(company, {
    fields: [tag.companyId],
    references: [company.id],
  }),
  tagToUploads: many(tagToUpload),
}))
