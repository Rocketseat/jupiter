import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface GetTranscriptionParams {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: GetTranscriptionParams) {
  const videoId = params.id

  try {
    const transcription = await prisma.transcription.findUniqueOrThrow({
      where: {
        videoId,
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
