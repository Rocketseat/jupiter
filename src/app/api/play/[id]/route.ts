import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

interface PlayVideoParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: PlayVideoParams) {
  const { search } = new URL(request.url)

  const video = await prisma.video.findUniqueOrThrow({
    where: {
      id: params.id,
      NOT: {
        externalProviderId: null,
      },
    },
  })

  const redirectUrl = new URL(
    '/embed',
    'https://player-vz-762f4670-e04.tv.pandavideo.com.br',
  )

  redirectUrl.search = search.concat(`&v=${video.externalProviderId}`)

  return NextResponse.redirect(redirectUrl, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
    status: 301,
  })
}
