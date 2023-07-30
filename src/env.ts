import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const nodeEnv = z.enum(['development', 'production', 'test'])

function requiredOnEnv(env: z.infer<typeof nodeEnv>) {
  return (value: any) => {
    if (env === process.env.NODE_ENV && !value) {
      return false
    }

    return true
  }
}

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    CLOUDFLARE_ACCESS_KEY: z.string().min(1),
    CLOUDFLARE_SECRET_KEY: z.string().min(1),
    CLOUDFLARE_UPLOAD_BUCKET_ID: z.string().min(1),
    CLOUDFLARE_UPLOAD_BUCKET_NAME: z.string().min(1),
    CLOUDFLARE_STORAGE_BUCKET_NAME: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    PANDAVIDEO_API_KEY: z.string().min(1),
    PANDAVIDEO_UPLOAD_FOLDER: z.string().uuid().min(1),
    NEXTAUTH_URL: z.string().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    QSTASH_TOKEN: z.string().refine(requiredOnEnv('production')),
    QSTASH_CURRENT_SIGNING_KEY: z.string().refine(requiredOnEnv('production')),
    QSTASH_NEXT_SIGNING_KEY: z.string().refine(requiredOnEnv('production')),
    KAFKA_BROKER_URL: z.string().refine(requiredOnEnv('production')),
    KAFKA_USERNAME: z.string().refine(requiredOnEnv('production')),
    KAFKA_PASSWORD: z.string().refine(requiredOnEnv('production')),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().url().min(1),
  },
  shared: {
    NODE_ENV: nodeEnv,
    VERCEL_ENV: z
      .enum(['production', 'preview', 'development'])
      .default('development'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  },
})
