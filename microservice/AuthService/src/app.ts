import 'reflect-metadata'
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

function createAuthApp(): Express {
  const app: Express = express()
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.use('/api/v0/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
    res.send(
      swaggerUi.generateHTML(await import('../build/swagger.json'))
    )
  })

  const { RegisterRoutes } = require('../build/build/routes') // why is this double nested btw
  const router = Router()
  RegisterRoutes(router)
  app.use('/api/v0', router)

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next: NextFunction) => {
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      errors: err.errors || null,
      status: err.status || 500,
    })
  }
  app.use(errorHandler)

  return app
}

const app = createAuthApp()

export { createAuthApp }
export default app
