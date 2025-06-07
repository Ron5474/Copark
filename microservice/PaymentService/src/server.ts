import 'reflect-metadata';
import dotenv from 'dotenv'
import { resolve } from 'path';

export function getEnvPath(dir: string): string {
  const isBuilt = dir.includes('/build') || dir.includes('\\build')
  return resolve(dir, isBuilt ? '../../../../.prod.env' : '../../../.env')
}
const p = getEnvPath(__dirname)
dotenv.config({ path: p})

import { app } from './app'

app.listen(3014, () => {
  console.log(`Server Running on port 3014`)
  console.log('API Testing UI: http://localhost:3014/api/v0/docs/')
})