import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { video } from '.'

export const webhookType = pgEnum('WebhookType', [
  'CREATE_SUBTITLES_FROM_TRANSCRIPTION',
  'UPDATE_EXTERNAL_PROVIDER_STATUS',
  'UPLOAD_TO_EXTERNAL_PROVIDER',
  'CREATE_TRANSCRIPTION',
  'PROCESS_VIDEO',
])

export const webhookStatus = pgEnum('WebhookStatus', [
  'ERROR',
  'SUCCESS',
  'RUNNING',
])

export const webhook = pgTable('Webhook', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('videoId')
    .notNull()
    .references(() => video.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  type: webhookType('type').notNull(),
  status: webhookStatus('status').default('RUNNING').notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
    .defaultNow()
    .notNull(),
  finishedAt: timestamp('finishedAt', { precision: 3, mode: 'string' }),
  metadata: text('metadata'),
})

export const webhookRelations = relations(webhook, ({ one }) => ({
  video: one(video, {
    fields: [webhook.videoId],
    references: [video.id],
  }),
}))
