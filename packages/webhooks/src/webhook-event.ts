import { z } from 'zod'

import {
  tagCreatedSchema,
  tagDeletedSchema,
  uploadCreatedSchema,
  uploadDeletedSchema,
  uploadTranscriptionCreatedSchema,
  uploadUpdatedSchema,
} from './events'

export const webhookEventSchema = z.discriminatedUnion('trigger', [
  z.object({
    trigger: z.literal('upload.created'),
    payload: uploadCreatedSchema,
  }),
  z.object({
    trigger: z.literal('upload.updated'),
    payload: uploadUpdatedSchema,
  }),
  z.object({
    trigger: z.literal('upload.deleted'),
    payload: uploadDeletedSchema,
  }),
  z.object({
    trigger: z.literal('upload.transcription.created'),
    payload: uploadTranscriptionCreatedSchema,
  }),
  z.object({
    trigger: z.literal('tag.created'),
    payload: tagCreatedSchema,
  }),
  z.object({
    trigger: z.literal('tag.deleted'),
    payload: tagDeletedSchema,
  }),
])

export type WebhookEvent = z.infer<typeof webhookEventSchema>
