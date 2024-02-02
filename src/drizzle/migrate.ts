import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

import { env } from '../env'

neonConfig.fetchConnectionCache = true

const connection = neon(env.DATABASE_URL)
const db = drizzle(connection)

migrate(db, { migrationsFolder: 'drizzle' }).then(() => {
  console.log('Migrations applied successfully!')
})
