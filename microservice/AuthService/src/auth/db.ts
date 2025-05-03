import {Pool} from 'pg'

const pool = new Pool({
  host: (process.env.POSTGRES_HOST || 'localhost'),
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
  database: 'auth',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

export {pool}
