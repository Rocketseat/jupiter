import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const verificationToken = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => {
    return {
      tokenUnique: uniqueIndex().on(table.token),
      identifierTokenKey: primaryKey({
        columns: [table.identifier, table.token],
      }),
    }
  },
)
