import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const verificationToken = pgTable(
  'VerificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
  },
  (table) => {
    return {
      tokenKey: uniqueIndex('VerificationToken_token_key').on(table.token),
      identifierTokenKey: uniqueIndex(
        'VerificationToken_identifier_token_key',
      ).on(table.identifier, table.token),
    }
  },
)
