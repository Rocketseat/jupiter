import { openai } from '@nivo/openai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'edge'
export const preferredRegion = 'cle1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = z.string().parse(searchParams.get('slug'))

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-0125',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'Converta o nome do arquivo de uma aula de programação sem acentuação ou espaços em um texto legível. Exemplo: converta "01-fundamentos-de-nodejs.mp4" em "Fundamentos de Node.js". Capitalize as palavras.',
      },
      {
        role: 'system',
        content: 'Se possível, corrija palavras que estão escritas erradas.',
      },
      {
        role: 'system',
        content: 'Retorne somente o texto convertido, nada além disso.',
      },
      { role: 'user', content: `Converta o título: ${slug}` },
    ],
  })

  const data = await response.json()

  return NextResponse.json({ title: data.choices[0].message.content })
}
