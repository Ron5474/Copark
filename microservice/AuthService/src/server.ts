import 'reflect-metadata';
import dotenv from 'dotenv'
import { resolve } from 'path'

// const isBuilt = __dirname.includes('/build') || __dirname.includes('\\build');
// const p = resolve(__dirname, isBuilt ? '../../../../.prod.env': '../../../.env')
export function getEnvPath(dir: string): string {
  const isBuilt = dir.includes('/build') || dir.includes('\\build')
  return resolve(dir, isBuilt ? '../../../../.prod.env' : '../../../.env')
}
const p = getEnvPath(__dirname)
dotenv.config({ path: p})


// import app from './app';
import { app } from './app'

app.listen(3010, () => {
  console.log(`Server Running on port 3010`)
  console.log('API Testing UI: http://localhost:3010/api/v0/docs/')
})