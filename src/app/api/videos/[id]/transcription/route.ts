import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface TranscriptionParams {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: TranscriptionParams) {
  const videoId = params.id

  try {
    const transcription = await prisma.transcription.findUniqueOrThrow({
      where: {
        videoId,
      },
      include: {
        segments: true,
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
