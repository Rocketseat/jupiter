import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const search = searchParams.get('q') ?? ''

  try {
    const videos = await prisma.video.findMany({
      where: search
        ? {
            title: {
              search: search.split(' ').join(' & '),
            },
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    return NextResponse.json({ videos })
  } catch (err) {
    console.log(err)
  }
}
