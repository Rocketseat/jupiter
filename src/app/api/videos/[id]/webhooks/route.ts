import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

interface GetVideoWebhooksParams {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: GetVideoWebhooksParams) {
  const videoId = params.id

  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        videoId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ webhooks })
  } catch (err) {
    console.log(err)
  }
}
