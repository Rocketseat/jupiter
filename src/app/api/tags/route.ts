import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTagBodySchema = z.object({
  tag: z.string(),
})

export async function POST(request: Request) {
  const requestBody = await request.json()
  const { tag } = createTagBodySchema.parse(requestBody)

  try {
    await prisma.tag.create({
      data: {
        slug: tag,
      },
    })

    return new Response()
  } catch (err) {
    console.log(err)
  }
}
