import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const sql = neon(process.env.DATABASE_URL)

export default sql

/**
 * Initialize the database table if it doesn't exist.
 * Call this on first run or via a migration script.
 */
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS apuestas (
      id SERIAL PRIMARY KEY,
      participante VARCHAR(100) NOT NULL,
      equipo VARCHAR(100) NOT NULL,
      bandera_emoji VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}
