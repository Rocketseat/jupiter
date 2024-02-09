import { env } from '@nivo/env'
import type { Config } from 'drizzle-kit'

export default {
  schema: './schema/index.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config
