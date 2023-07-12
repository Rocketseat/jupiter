import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const search = searchParams.get('q')

  try {
    const videos = await prisma.video.findMany({
      where: search
        ? {
            title: {
              search,
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
