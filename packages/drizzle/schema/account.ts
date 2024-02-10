import type { AdapterAccount } from '@auth/core/adapters'
import { relations } from 'drizzle-orm'
import { integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { user } from '.'

export const account = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    scope: text('scope'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    idToken: text('id_token'),
    refreshToken: text('refresh_token'),
    sessionState: text('session_state'),
    tokenType: text('token_type'),
  },
  (table) => {
    return {
      providerProviderAccountIdUnique: uniqueIndex().on(
        table.provider,
        table.providerAccountId,
      ),
    }
  },
)

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
