import { env } from '@/env'
import { Configuration, OpenAIApi } from 'openai-edge'

const config = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(config)
