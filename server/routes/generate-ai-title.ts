import { Elysia, t } from 'elysia'

import { openai } from '@/lib/openai'

export const generateAITitle = new Elysia().get(
  '/ai/generate/title',
  async ({ query }) => {
    const { slug } = query

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
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

    return {
      title: data.choices[0].message.content,
    }
  },
  {
    query: t.Object({
      slug: t.String(),
    }),
  },
)
