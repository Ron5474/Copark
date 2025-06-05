import * as dotenv from 'dotenv'
import { resolve } from 'path'

export function getEnvPath(dir: string): string {
  const isBuilt = dir.includes('/build') || dir.includes('\\build')
  return resolve(dir, isBuilt ? '../../../.prod.env' : '../../../.env')
}
const p = getEnvPath(__dirname)
dotenv.config({ path: p })

import { app, bootstrap } from './app'

app.listen(4002, async () => {
  await bootstrap()
  console.log('Running a GraphQL Playground at http://localhost:4002/playground')
})