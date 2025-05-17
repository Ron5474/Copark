import express from 'express'
import router from './email/routes'

const app = express()
app.use(express.json())
app.use('/email', router)

export { app }
