import { Pool } from 'pg';
import dotenv from 'dotenv'

dotenv.config({path: '../../.env'})

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5432,
  database: process.env.POSTGRES_VEHICLE_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export { pool };