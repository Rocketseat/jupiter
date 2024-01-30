import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

interface TranscriptionParams {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: TranscriptionParams) {
  const videoId = params.id

  try {
    const transcription = await prisma.transcription.findUnique({
      where: {
        videoId,
      },
      include: {
        segments: {
          orderBy: {
            start: 'asc',
          },
        },
      },
    })

    if (!transcription) {
      return NextResponse.json(
        { message: 'Transcription was not generated yet.' },
        {
          status: 400,
        },
      )
    }

    return NextResponse.json({ transcription })
  } catch (err) {
    console.log(err)
  }
}
