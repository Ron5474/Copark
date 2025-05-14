import express, { Express } from 'express'
import path from 'path'
import cors from 'cors'
import { createHandler } from 'graphql-http/lib/use/express'
import { renderPlaygroundPage } from 'graphql-playground-html'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'

import { resolvers } from './resolvers'
import { expressAuthChecker } from './auth/checker'

const app: Express = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))

async function bootstrap() {
  const schema = await buildSchema({
    resolvers,
    validate: true,
    authChecker: expressAuthChecker,
    emitSchemaFile: {
      path: path.resolve(__dirname, '../build/schema.gql'),
      sortedSchema: true,
    },
  })

  app.use(
    '/graphql',
    createHandler({
      schema,
      context: (req) => ({
        headers: req.headers,
      }),
    })
  )

  app.get('/playground', (_req, res) => {
    res.send(renderPlaygroundPage({ endpoint: '/graphql' }))
  })
}

export { app, bootstrap }
