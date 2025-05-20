import * as dotenv from 'dotenv'
import { resolve } from 'path'

const isBuilt = __dirname.includes('/build') || __dirname.includes('\\build');
const p = resolve(__dirname, isBuilt ? '../../../.prod.env': '../../../.env')
dotenv.config({ path: p})


import { app, bootstrap } from './app'

app.listen(4001, async () => {
  await bootstrap()
  console.log('Running a GraphQL Playground at http://localhost:4001/playground')
})
