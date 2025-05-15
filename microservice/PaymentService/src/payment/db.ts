import {Pool} from 'pg'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../../../.env') })

// console.log('Connecting to PostgreSQL database...')
// console.log('POSTGRES_HOST', process.env.POSTGRES_HOST)
// console.log('POSTGRES_PORT', process.env.POSTGRES_PORT)
// console.log('POSTGRES_USER', process.env.POSTGRES_USER)
// console.log('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD)

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string, 10),
  database: process.env.POSTGRES_PAYMENT_DB,
  // database: 'auth',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

export {pool}
