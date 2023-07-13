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
    const [transcription] = await prisma.$queryRaw<
      [{ text: string; id: string }]
    >/* sql */ `
      SELECT 
      "public"."TranscriptionSegment"."transcriptionId" as "id",
        STRING_AGG("public"."TranscriptionSegment"."text", '') as "text"
      FROM "public"."TranscriptionSegment"
      JOIN "public"."Transcription" ON "public"."Transcription"."id" = "public"."TranscriptionSegment"."transcriptionId"
      WHERE "public"."Transcription"."videoId" = ${videoId}
      GROUP BY "public"."TranscriptionSegment"."transcriptionId"
    `

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
