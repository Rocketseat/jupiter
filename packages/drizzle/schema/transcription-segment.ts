import { relations } from 'drizzle-orm'
import { numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { transcription } from '.'

export const transcriptionSegment = pgTable('transcription_segments', {
  id: uuid('id').primaryKey().defaultRandom(),
  transcriptionId: uuid('transcription_id')
    .notNull()
    .references(() => transcription.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  start: numeric('start', { precision: 10, scale: 2 }).notNull(),
  end: numeric('end', { precision: 10, scale: 2 }).notNull(),
  text: text('text').notNull(),
})

export const transcriptionSegmentRelations = relations(
  transcriptionSegment,
  ({ one }) => ({
    transcription: one(transcription, {
      fields: [transcriptionSegment.transcriptionId],
      references: [transcription.id],
    }),
  }),
)
