import { Pool } from '@neondatabase/serverless'
import { env } from '@nivo/env'
import { drizzle } from 'drizzle-orm/neon-serverless'

import * as schema from './schema'

const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })
