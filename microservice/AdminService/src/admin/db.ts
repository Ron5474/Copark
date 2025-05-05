import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5432,
<<<<<<< HEAD
  database: process.env.POSTGRES_DB,
=======
  database: 'dev',
>>>>>>> 02f0ed3de02eb969c39567a3162b7c5a9db718ea
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export { pool };