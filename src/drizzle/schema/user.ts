import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { account, company, session } from '.'

export const user = pgTable(
  'User',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('companyId')
      .notNull()
      .references(() => company.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    name: text('name'),
    email: text('email').notNull(),
    emailVerified: timestamp('emailVerified'),
    image: text('image'),
  },
  (table) => {
    return {
      emailKey: uniqueIndex('User_email_key').on(table.email),
    }
  },
)

export const userRelations = relations(user, ({ one, many }) => ({
  company: one(company, {
    fields: [user.companyId],
    references: [company.id],
  }),
  sessions: many(session),
  accounts: many(account),
}))
