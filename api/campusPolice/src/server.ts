import dotenv from 'dotenv'
import { resolve } from 'path';

const isBuilt = __dirname.includes('/build') || __dirname.includes('\\build');
const p = resolve(__dirname, isBuilt ? '../../../../.prod.env': '../../../.env')
dotenv.config({ path: p})

import app from './app'

app.listen(3011, () => {
  console.log(`Server Running on port 3011`)
  console.log('API Testing UI: http://localhost:3011/api/v0/docs/')
})