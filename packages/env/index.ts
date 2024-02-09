import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_URL: z.string().min(1),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    CLOUDFLARE_ACCESS_KEY: z.string().min(1),
    CLOUDFLARE_SECRET_KEY: z.string().min(1),
    CLOUDFLARE_UPLOAD_BUCKET_ID: z.string().min(1),
    CLOUDFLARE_UPLOAD_BUCKET_NAME: z.string().min(1),
    CLOUDFLARE_STORAGE_BUCKET_NAME: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    PANDAVIDEO_API_KEY: z.string(),
    PANDAVIDEO_UPLOAD_FOLDER: z.string().uuid().min(1),
    BUNNY_API_KEY: z.string(),
    NEXTAUTH_URL: z.string().optional(),
    AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    QSTASH_URL: z.string().url(),
    QSTASH_TOKEN: z.string(),
    QSTASH_TOPIC: z.string(),
    QSTASH_CURRENT_SIGNING_KEY: z.string(),
    QSTASH_NEXT_SIGNING_KEY: z.string(),
    QSTASH_PUBLISH_MESSAGES: z
      .string()
      .transform((value) => value === 'true')
      .default('true'),
    QSTASH_VALIDATE_SIGNATURE: z
      .string()
      .transform((value) => value === 'true')
      .default('true'),
    KAFKA_BROKER_URL: z.string().optional(),
    KAFKA_USERNAME: z.string().optional(),
    KAFKA_PASSWORD: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().url().min(1),
  },
  shared: {
    VERCEL_ENV: z
      .enum(['production', 'preview', 'development'])
      .default('development'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ACCESS_KEY: process.env.CLOUDFLARE_ACCESS_KEY,
    CLOUDFLARE_SECRET_KEY: process.env.CLOUDFLARE_SECRET_KEY,
    CLOUDFLARE_UPLOAD_BUCKET_ID: process.env.CLOUDFLARE_UPLOAD_BUCKET_ID,
    CLOUDFLARE_UPLOAD_BUCKET_NAME: process.env.CLOUDFLARE_UPLOAD_BUCKET_NAME,
    CLOUDFLARE_STORAGE_BUCKET_NAME: process.env.CLOUDFLARE_STORAGE_BUCKET_NAME,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PANDAVIDEO_API_KEY: process.env.PANDAVIDEO_API_KEY,
    PANDAVIDEO_UPLOAD_FOLDER: process.env.PANDAVIDEO_UPLOAD_FOLDER,
    BUNNY_API_KEY: process.env.BUNNY_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_TOPIC: process.env.QSTASH_TOPIC,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    QSTASH_PUBLISH_MESSAGES: process.env.QSTASH_PUBLISH_MESSAGES,
    QSTASH_VALIDATE_SIGNATURE: process.env.QSTASH_VALIDATE_SIGNATURE,
    KAFKA_BROKER_URL: process.env.KAFKA_BROKER_URL,
    KAFKA_USERNAME: process.env.KAFKA_USERNAME,
    KAFKA_PASSWORD: process.env.KAFKA_PASSWORD,
  },
  emptyStringAsUndefined: true,
})
