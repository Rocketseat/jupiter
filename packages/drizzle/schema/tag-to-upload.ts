import { relations } from 'drizzle-orm'
import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { tag, upload } from '.'

export const tagToUpload = pgTable(
  'tag_to_uploads',
  {
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    uploadId: uuid('upload_id')
      .notNull()
      .references(() => upload.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => {
    return {
      tagIdUploadIdUnique: uniqueIndex().on(table.tagId, table.uploadId),
      uploadIdIndex: index().on(table.uploadId),
    }
  },
)

export const tagToVideoRelations = relations(tagToUpload, ({ one }) => ({
  tag: one(tag, {
    fields: [tagToUpload.tagId],
    references: [tag.id],
  }),
  upload: one(upload, {
    fields: [tagToUpload.uploadId],
    references: [upload.id],
  }),
}))
