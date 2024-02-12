import { neon, neonConfig } from '@neondatabase/serverless'
import { env } from '@nivo/env'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

neonConfig.fetchConnectionCache = true

const connection = neon(env.DATABASE_URL)
const db = drizzle(connection)

migrate(db, { migrationsFolder: __dirname.concat('/migrations') }).then(() => {
  console.log('Migrations applied successfully!')
})
