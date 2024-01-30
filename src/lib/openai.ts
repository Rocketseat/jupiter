import { Configuration, OpenAIApi } from 'openai-edge'

import { env } from '@/env'

const config = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(config)
