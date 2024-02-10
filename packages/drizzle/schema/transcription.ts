import { relations } from 'drizzle-orm'
import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { transcriptionSegment, upload } from '.'

export const transcription = pgTable(
  'transcriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    uploadId: uuid('upload_id')
      .notNull()
      .references(() => upload.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      uploadIdUnique: uniqueIndex().on(table.uploadId),
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
