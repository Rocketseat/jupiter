import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { account, company, session, uploadBatch } from '.'

export const user = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    name: text('name'),
    email: text('email').notNull(),
    emailVerified: timestamp('email_verified'),
    image: text('image'),
  },
  (table) => {
    return {
      emailUnique: uniqueIndex().on(table.email),
    }
  },
)

export const userRelations = relations(user, ({ one, many }) => ({
  company: one(company, {
    fields: [user.companyId],
    references: [company.id],
  }),
  sessions: many(session),
  uploadBatches: many(uploadBatch),
  accounts: many(account),
}))
