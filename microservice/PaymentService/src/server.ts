import 'reflect-metadata';
import dotenv from 'dotenv'
import { resolve } from 'path';

const isBuilt = __dirname.includes('/build') || __dirname.includes('\\build');
const p = resolve(__dirname, isBuilt ? '../../../../.env': '../../../.env')
dotenv.config({ path: p})


import app from './app'

app.listen(3014, () => {
  console.log(`Server Running on port 3014`)
  console.log('API Testing UI: http://localhost:3014/api/v0/docs/')
})