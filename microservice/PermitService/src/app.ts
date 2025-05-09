import express, { Express } from 'express'
import cors from 'cors'
import path from 'path'
import { createHandler } from 'graphql-http/lib/use/express'
import { renderPlaygroundPage } from 'graphql-playground-html'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'

import { resolvers } from './resolvers'
import { expressAuthChecker } from './auth/checker'

const app: Express = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
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

  app.get('/playground', (req, res) => {
    res.send(renderPlaygroundPage({ endpoint: '/graphql' }))
  })
}

export { app, bootstrap }
