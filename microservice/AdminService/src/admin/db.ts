import { Pool } from 'pg';




// console.log('PORT: ', process.env.POSTGRES_PORT)
// console.log('POSTGRES_AUTH_DB: ', process.env.POSTGRES_AUTH_DB)
// console.log('POSTGRES_USER: ', process.env.POSTGRES_USER)
// console.log('POSTGRES_PASSWORD: ', process.env.POSTGRES_PASSWORD)

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string, 10),
  database: process.env.POSTGRES_AUTH_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export { pool };