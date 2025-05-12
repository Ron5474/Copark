import {Pool} from 'pg'
import dotenv from 'dotenv'

import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../.env') })

const vehiclePool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string, 10),
  database: 'vehc',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

const ticketPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string, 10),
  database: 'ticket',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

export {vehiclePool, ticketPool}
