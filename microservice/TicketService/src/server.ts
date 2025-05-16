import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../../.env') })

import { app, bootstrap } from './app'

app.listen(4002, async () => {
  await bootstrap()
  console.log('Running a GraphQL Playground at http://localhost:4002/playground')
})