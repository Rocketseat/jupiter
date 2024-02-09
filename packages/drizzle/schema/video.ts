import { relations } from 'drizzle-orm'
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { company, tagToVideo, transcription, uploadBatch, user } from '.'

export type BunnyStatus =
  | 'created'
  | 'uploaded'
  | 'processing'
  | 'transcoding'
  | 'finished'
  | 'error'
  | 'failed'

export const video = pgTable(
  'Video',
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
      externalProviderIdKey: uniqueIndex('Video_externalProviderId_key').on(
        table.externalProviderId,
      ),
    }
  },
)

export const videoRelations = relations(video, ({ one, many }) => ({
  uploadBatch: one(uploadBatch, {
    fields: [video.uploadBatchId],
    references: [uploadBatch.id],
  }),
  company: one(company, {
    fields: [video.companyId],
    references: [company.id],
  }),
  author: one(user, {
    fields: [video.authorId],
    references: [user.id],
  }),
  transcription: one(transcription, {
    fields: [video.id],
    references: [transcription.videoId],
  }),
  tagToVideos: many(tagToVideo),
}))
