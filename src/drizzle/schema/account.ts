import { relations } from 'drizzle-orm'
import { integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { user } from '.'

export const account = pgTable(
  'Account',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    scope: text('scope'),
    accessToken: text('accessToken'),
    expiresAt: integer('expiresAt'),
    idToken: text('idToken'),
    refreshToken: text('refreshToken'),
    sessionState: text('sessionState'),
    tokenType: text('tokenType'),
  },
  (table) => {
    return {
      providerProviderAccountIdKey: uniqueIndex(
        'Account_provider_providerAccountId_key',
      ).on(table.provider, table.providerAccountId),
    }
  },
)

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
