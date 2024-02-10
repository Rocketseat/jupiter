import { relations } from 'drizzle-orm'
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { company, tagToUpload, transcription, uploadBatch, user } from '.'

export type BunnyStatus =
  | 'created'
  | 'uploaded'
  | 'processing'
  | 'transcoding'
  | 'finished'
  | 'error'
  | 'failed'

export const upload = pgTable(
  'uploads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    duration: integer('duration').notNull(),
    title: text('title').notNull(),
    storageKey: text('storage_key'),
    description: text('description'),
    uploadBatchId: uuid('upload_batch_id').references(() => uploadBatch.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    authorId: uuid('author_id').references(() => user.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    externalProviderId: text('external_provider_id'),
    externalStatus: text('external_status').$type<BunnyStatus>(),
    audioStorageKey: text('audio_storage_key'),
    processedAt: timestamp('processed_at'),
    sizeInBytes: integer('size_in_bytes').notNull(),
    uploadOrder: integer('upload_order').notNull(),
    commitUrl: text('commit_url'),
    subtitlesStorageKey: text('subtitles_storage_key'),
    language: text('language').default('pt').$type<'pt' | 'es'>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      externalProviderIdUnique: uniqueIndex().on(table.externalProviderId),
    }
  },
)

export const uploadRelations = relations(upload, ({ one, many }) => ({
  uploadBatch: one(uploadBatch, {
    fields: [upload.uploadBatchId],
    references: [uploadBatch.id],
  }),
  company: one(company, {
    fields: [upload.companyId],
    references: [company.id],
  }),
  author: one(user, {
    fields: [upload.authorId],
    references: [user.id],
  }),
  transcription: one(transcription, {
    fields: [upload.id],
    references: [transcription.uploadId],
  }),
  tagToUploads: many(tagToUpload),
}))
