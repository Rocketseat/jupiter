import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface PlayVideoParams {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: PlayVideoParams) {
  const video = await prisma.video.findUniqueOrThrow({
    where: {
      id: params.id,
      NOT: {
        externalProviderId: null,
      },
    },
  })

  return NextResponse.redirect(
    `https://b-vz-762f4670-e04.tv.pandavideo.com.br/${video.externalProviderId}/playlist.m3u8`,
  )
}
