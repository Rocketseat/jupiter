import { z } from 'zod'

export const tagCreatedSchema = z.object({
  slug: z.string(),
})

export type TagCreated = z.infer<typeof tagCreatedSchema>
