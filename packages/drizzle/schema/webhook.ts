import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { upload } from '.'

export const uploadWebhookType = pgEnum('UploadWebhookType', [
  'CREATE_SUBTITLES_FROM_TRANSCRIPTION',
  'UPDATE_EXTERNAL_PROVIDER_STATUS',
  'UPLOAD_TO_EXTERNAL_PROVIDER',
  'CREATE_TRANSCRIPTION',
  'PROCESS_VIDEO',
])

export const uploadWebhookStatus = pgEnum('UploadWebhookStatus', [
  'ERROR',
  'SUCCESS',
  'RUNNING',
])

export const uploadWebhook = pgTable('UploadWebhook', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadId: uuid('uploadId')
    .notNull()
    .references(() => upload.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  type: uploadWebhookType('type').notNull(),
  status: uploadWebhookStatus('status').default('RUNNING').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  finishedAt: timestamp('finishedAt'),
  metadata: text('metadata'),
})

export const uploadWebhookRelations = relations(uploadWebhook, ({ one }) => ({
  upload: one(upload, {
    fields: [uploadWebhook.uploadId],
    references: [upload.id],
  }),
}))
