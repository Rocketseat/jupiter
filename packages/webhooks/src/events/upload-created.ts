import { z } from 'zod'

export const uploadCreatedSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  duration: z.number(),
  streamUrl: z.string().url().nullable(),
  tags: z.array(z.string()),
})

export type UploadCreated = z.infer<typeof uploadCreatedSchema>
