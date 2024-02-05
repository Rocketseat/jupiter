import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const verificationToken = pgTable(
  'VerificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => {
    return {
      tokenKey: uniqueIndex('VerificationToken_token_key').on(table.token),
      identifierTokenKey: primaryKey({
        columns: [table.identifier, table.token],
      }),
    }
  },
)
