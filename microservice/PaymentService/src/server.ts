import 'reflect-metadata';
import dotenv from 'dotenv'
dotenv.config()

import app from './app'

app.listen(3014, () => {
  console.log(`Server Running on port 3014`)
  console.log('API Testing UI: http://localhost:3014/api/v0/docs/')
})