import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { company, tagToVideo } from '.'

export const tag = pgTable(
  'Tag',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    companyId: uuid('companyId')
      .notNull()
      .references(() => company.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  (table) => {
    return {
      slugKey: uniqueIndex('Tag_slug_key').on(table.slug),
    }
  },
)

export const tagRelations = relations(tag, ({ one, many }) => ({
  company: one(company, {
    fields: [tag.companyId],
    references: [company.id],
  }),
  tagToVideos: many(tagToVideo),
}))
