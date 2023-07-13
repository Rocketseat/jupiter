import { z } from 'zod'

export const videoSchema = z.object({
  id: z.string().uuid(),
  duration: z.number(),
  sizeInBytes: z.number(),
  title: z.string(),
  storageKey: z.string(),
  audioStorageKey: z.string(),
  uploadBatchId: z.string().uuid(),
  externalProviderId: z.string().uuid(),
  processedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  transcription: z
    .object({
      id: z.string(),
    })
    .optional(),
})

export type Video = z.infer<typeof videoSchema>
