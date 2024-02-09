import { relations } from 'drizzle-orm'
import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { tag, video } from '.'

export const tagToVideo = pgTable(
  '_TagToVideo',
  {
    a: uuid('A')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    b: uuid('B')
      .notNull()
      .references(() => video.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => {
    return {
      abUnique: uniqueIndex('_TagToVideo_AB_unique').on(table.a, table.b),
      bIdx: index().on(table.b),
    }
  },
)

export const tagToVideoRelations = relations(tagToVideo, ({ one }) => ({
  tag: one(tag, {
    fields: [tagToVideo.a],
    references: [tag.id],
  }),
  video: one(video, {
    fields: [tagToVideo.b],
    references: [video.id],
  }),
}))
