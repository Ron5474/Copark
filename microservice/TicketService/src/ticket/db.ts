import { Pool } from 'pg';

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../../../.env') })

console.log(`ticket service is connected to ${process.env.POSTGRES_DB} database`)

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string, 10),
  database: process.env.POSTGRES_TICKET_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// console.log(process.env.POSTGRES_DB);

export { pool };