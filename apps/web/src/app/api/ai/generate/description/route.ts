import { db } from '@nivo/drizzle'
import { transcription, transcriptionSegment } from '@nivo/drizzle/schema'
import { openai } from '@nivo/openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const preferredRegion = 'cle1'

export async function POST(request: Request) {
  const { prompt: videoId } = await request.json()

  const [{ text }] = await db
    .select({
      text: sql<string>`STRING_AGG(${transcriptionSegment.text}, '')`,
    })
    .from(transcriptionSegment)
    .innerJoin(
      transcription,
      eq(transcription.id, transcriptionSegment.transcriptionId),
    )
    .where(eq(transcription.videoId, videoId))

  if (!text) {
    return NextResponse.json(
      { message: 'Transcription not found.' },
      { status: 400 },
    )
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-16k',
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Se comporte como um especialista em programação que cria resumos a partir da transcrição de uma aula. Os resumos devem ter foco educacional para dar contexto sobre uma aula que será publicada numa plataforma de vídeos e deve explicar detalhes sobre o vídeo sem necessariamente replicar o passo à passo do vídeo.',
      },
      {
        role: 'system',
        content:
          'Responda em primeira pessoa como se você fosse o instrutor da aula. Utilize uma linguagem menos formal. Evite repetir as palavras muitas vezes, use sinônimos sempre que possível.',
      },
      {
        role: 'system',
        content:
          'Seja sucinto e retorne no máximo 80 palavras em markdown sem cabeçalhos.',
      },
      {
        role: 'user',
        content: `Gere um resumo da transcrição abaixo. Retorne o resumo no mesmo idioma da transcrição. \n\n ${text}`,
      },
    ],
    temperature: 0,
  })

  const stream = OpenAIStream(response)

  return new StreamingTextResponse(stream)
}
