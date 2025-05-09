import { Pool } from 'pg'
import * as fs from 'fs'

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../../.env') })

process.env.POSTGRES_PORT = '5433'

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

const run = async (file: string) => {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split(/\r?\n/)

  let currentPool = pool
  let statement = ''

  for (let line of lines) {
    line = line.trim()
    if (!line || line.startsWith('--')) continue

    if (line.startsWith('\\connect')) {
      const [, newDbRaw] = line.split(/\s+/)
      const newDb = newDbRaw.replace(/;$/, '') 

      // End previous pool and create a new one for the new database
      // if (currentPool !== pool) {
      //   await currentPool.end()
      // }

      currentPool = new Pool({
        host: 'localhost',
        port: 5433,
        database: newDb,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
      })

      continue
    }

    statement += ' ' + line + '\n'
    if (line.endsWith(';')) {
      await currentPool.query(statement)
      statement = ''
    }
  }

  // Clean up if we created a new pool
  if (currentPool !== pool) {
    await currentPool.end()
  }
}


const path = '../../microservice/'

const reset = async () => {
  await run(path + 'AuthService/sql/schema.sql')
  await run(path + 'AuthService/sql/data.sql')
  await run(path + 'AdminService/sql/schema.sql')
  await run(path + 'AdminService/sql/data.sql')
  await run(path + 'VehicleService/sql/schema.sql')
  await run(path + 'VehicleService/sql/data.sql')
}

const shutdown = () => {
  pool.end()
}

export default { reset, shutdown }