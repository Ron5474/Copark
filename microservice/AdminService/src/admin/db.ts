import {Pool} from 'pg'

const pool = new Pool({
  host: (process.env.POSTGRES_HOST || 'localhost'),
  port: 5432,
  database: 'test',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

export {pool}
