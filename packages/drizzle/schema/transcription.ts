import { relations } from 'drizzle-orm'
import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { transcriptionSegment, upload } from '.'

export const transcription = pgTable(
  'Transcription',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    uploadId: uuid('uploadId')
      .notNull()
      .references(() => upload.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    reviewedAt: timestamp('reviewedAt'),
  },
  (table) => {
    return {
      uploadIdKey: uniqueIndex('Transcription_uploadId_key').on(table.uploadId),
    }
  },
)

export const transcriptionRelations = relations(
  transcription,
  ({ one, many }) => ({
    upload: one(upload, {
      fields: [transcription.uploadId],
      references: [upload.id],
    }),
    segments: many(transcriptionSegment),
  }),
)
