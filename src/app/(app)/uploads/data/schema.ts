import { z } from 'zod'

export const videoSchema = z.object({
  id: z.string().uuid(),
  duration: z.number(),
  sizeInBytes: z.number(),
  title: z.string(),
  storageKey: z.string().nullable(),
  audioStorageKey: z.string().nullable(),
  uploadBatchId: z.string().uuid(),
  externalProviderId: z.string().uuid(),
  processedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  transcription: z
    .object({
      id: z.string(),
    })
    .optional(),
  tags: z
    .array(
      z.object({
        id: z.string().uuid(),
        slug: z.string(),
        createdAt: z.coerce.date(),
      }),
    )
    .optional(),
})

export type Video = z.infer<typeof videoSchema>
