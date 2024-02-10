import { z } from 'zod'

export const tagDeletedSchema = z.object({
  slug: z.string(),
})

export type TagDeleted = z.infer<typeof tagDeletedSchema>
