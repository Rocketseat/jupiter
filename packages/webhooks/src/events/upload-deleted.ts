import { z } from 'zod'

export const uploadDeletedSchema = z.object({
  id: z.string().uuid(),
})

export type UploadDeleted = z.infer<typeof uploadDeletedSchema>
