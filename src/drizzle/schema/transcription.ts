import { relations } from 'drizzle-orm'
import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { transcriptionSegment, video } from '.'

export const transcription = pgTable(
  'Transcription',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    videoId: uuid('videoId')
      .notNull()
      .references(() => video.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    reviewedAt: timestamp('reviewedAt', { precision: 3, mode: 'string' }),
  },
  (table) => {
    return {
      videoIdKey: uniqueIndex('Transcription_videoId_key').on(table.videoId),
    }
  },
)

export const transcriptionRelations = relations(
  transcription,
  ({ one, many }) => ({
    video: one(video, {
      fields: [transcription.videoId],
      references: [video.id],
    }),
    segments: many(transcriptionSegment),
  }),
)
