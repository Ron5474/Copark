import { app } from './app'
import dotenv from 'dotenv'
import { resolve } from 'path';

const isBuilt = __dirname.includes('/build') || __dirname.includes('\\build');
const p = resolve(__dirname, isBuilt ? '../../../.prod.env': '../../../.env')
dotenv.config({ path: p})
console.log('EmailService env', process.env.EMAIL_PORT)
const PORT = process.env.EMAIL_PORT || 3015
app.listen(PORT, () => {
  console.log(`EmailService running on http://localhost:${PORT}`)
})
