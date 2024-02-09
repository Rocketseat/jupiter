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
  'Upload',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    duration: integer('duration').notNull(),
    title: text('title').notNull(),
    storageKey: text('storageKey'),
    description: text('description'),
    uploadBatchId: uuid('uploadBatchId').references(() => uploadBatch.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    companyId: uuid('companyId')
      .notNull()
      .references(() => company.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    authorId: uuid('authorId').references(() => user.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    externalProviderId: text('externalProviderId'),
    externalStatus: text('externalStatus').$type<BunnyStatus>(),
    audioStorageKey: text('audioStorageKey'),
    processedAt: timestamp('processedAt'),
    sizeInBytes: integer('sizeInBytes').notNull(),
    uploadOrder: integer('uploadOrder').notNull(),
    commitUrl: text('commitUrl'),
    subtitlesStorageKey: text('subtitlesStorageKey'),
    language: text('language').default('pt').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => {
    return {
      externalProviderIdKey: uniqueIndex('Upload_externalProviderId_key').on(
        table.externalProviderId,
      ),
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
