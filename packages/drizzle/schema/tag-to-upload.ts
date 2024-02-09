import { relations } from 'drizzle-orm'
import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { tag, upload } from '.'

export const tagToUpload = pgTable(
  '_TagToUpload',
  {
    a: uuid('A')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    b: uuid('B')
      .notNull()
      .references(() => upload.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => {
    return {
      abUnique: uniqueIndex('_TagToUpload_AB_unique').on(table.a, table.b),
      bIdx: index().on(table.b),
    }
  },
)

export const tagToVideoRelations = relations(tagToUpload, ({ one }) => ({
  tag: one(tag, {
    fields: [tagToUpload.a],
    references: [tag.id],
  }),
  upload: one(upload, {
    fields: [tagToUpload.b],
    references: [upload.id],
  }),
}))
