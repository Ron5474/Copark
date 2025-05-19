import { app } from './app'
import dotenv from 'dotenv'
import { resolve } from 'path';

// const isBuilt = __dirname.includes('/build') || __dirname.includes('\\build');
// const p = resolve(__dirname, isBuilt ? '../../../../.env': '../../../.env')
// dotenv.config({ path: p})
dotenv.config({ path: resolve(__dirname, '../../../.env') })
const PORT = process.env.EMAIL_PORT || 3015
app.listen(PORT, () => {
  console.log(`EmailService running on http://localhost:${PORT}`)
})
