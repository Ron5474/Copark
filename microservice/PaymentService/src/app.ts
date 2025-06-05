import express, { 
  Express, 
  Router,
  Response as ExResponse, 
  Request as ExRequest, 
  ErrorRequestHandler,
  NextFunction
} from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import { RegisterRoutes } from "../build/routes"

const app: Express = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/v0/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  res.send(
    swaggerUi.generateHTML(await import('../build/swagger.json'))
  )
})

const router = Router()
RegisterRoutes(router)
app.use('/api/v0', router)

// Enhanced error handler
/* eslint-disable @typescript-eslint/no-unused-vars */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next: NextFunction) => {
  // console.log(process.env.POSTGRES_PASSWORD)
  // console.error('Error occurred:', err) // Log the error

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    status: err.status || 500,
  })
}
app.use(errorHandler)

export { app }
