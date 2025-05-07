import {Pool} from 'pg'
import dotenv from 'dotenv'

dotenv.config({path: '../../.env'})

console.log('Connecting to PostgreSQL database...')
console.log('POSTGRES_HOST', process.env.POSTGRES_HOST)
console.log('POSTGRES_PORT', process.env.POSTGRES_PORT)
console.log('POSTGRES_USER', process.env.POSTGRES_USER)
console.log('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD)

const pool = new Pool({
  host: (process.env.POSTGRES_HOST || 'localhost'),
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
  database: process.env.POSTGRES_DB,
  // database: 'auth',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

export {pool}
