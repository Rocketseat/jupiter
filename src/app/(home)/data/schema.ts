import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  uploadedAt: z.coerce.date(),
})

export type Task = z.infer<typeof taskSchema>
