import { test, beforeAll, afterAll, expect } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import { app, bootstrap } from '../src/app'

let server: http.Server

beforeAll(async () => {
    // Start your GraphQL server
    server = http.createServer(app)
    server.listen()
    await bootstrap()
})

afterAll(() => {
  server.close()
})


test('GET /playground returns the GraphQL Playground HTML', async () => {
    const response = await supertest(server)
        .get('/playground')
        .expect(200)

    expect(response.text).toContain('<title>GraphQL Playground</title>')
})