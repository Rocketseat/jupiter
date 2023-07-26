import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const revalidate = 60 * 15 // 15 minutes

export async function GET() {
  try {
    const webhooks = await prisma.webhook.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        video: true,
      },
      take: 6,
    })

    return NextResponse.json({ webhooks })
  } catch (err) {
    console.log(err)
  }
}
