import dotenv from 'dotenv'
dotenv.config()

import app from './app'

app.listen(8000, () => {
  console.log(`Server Running on port 8000`)
  console.log('API Testing UI: http://localhost:8000/api/v0/docs/')
})