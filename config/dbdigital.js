import pkg from 'pg'

const { Pool } = pkg

export const dbdigital = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB_DIGITAL,
  port: Number(process.env.PG_PORT),
  ssl: false,
})