import { z } from 'zod'

export const uploadTranscriptionCreatedSchema = z.object({
  id: z.string().uuid(),
  uploadId: z.string().uuid(),
  text: z.string(),
  segments: z.array(
    z.object({
      text: z.string(),
      timestamp: z.tuple([z.number(), z.number()]),
    }),
  ),
})

export type UploadTranscriptionCreated = z.infer<
  typeof uploadTranscriptionCreatedSchema
>
