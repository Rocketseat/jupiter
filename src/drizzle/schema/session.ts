import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from '.'

export const session = pgTable(
  'Session',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionToken: text('sessionToken').notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
  },
  (table) => {
    return {
      sessionTokenKey: uniqueIndex('Session_sessionToken_key').on(
        table.sessionToken,
      ),
    }
  },
)

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))
