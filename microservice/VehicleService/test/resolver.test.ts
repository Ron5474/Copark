import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'

let server: http.Server
let authServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

beforeAll(async () => {
  // Start your GraphQL server
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  // Start your Auth server
  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => {
      resolve()
    })
  })

  return
})

beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
})

const nextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3Njg5MjMsImV4cCI6MTg0MTQ2MzQ0MiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTA5MTY0MjQwOTk2MDEyNTE1NiIsImVtYWlsIjoiZGVyaWtAY29wYXJrLnNwYWNlIiwicGljdHVyZSI6IlwiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwibmFtZSI6IkRlcmlrIERyaXZlciJ9.D23uY9TRN-3UKSK8NxdgSP208iaCc8TuzWIYgYMfhwE"

// const driver = {
//     "name": "Derik Driver",
//     "email": "derik@copark.space",
//     "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
//     "sub": "1234567890",
//   }

const validDriverJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjM5ZjQ4ZjlmLTI2OTMtNDQ2Yi1hZDk4LThlMGRiMWVmMTRiZCIsImlhdCI6MTc0NzA2NzM2NSwiZXhwIjoxOTA0ODU1MzY1fQ.U90qXFiG-nLiqqbL32KwhGaLdlZc0NyA6XDnetN1SRQ"

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

async function loginAs(who: string): Promise<string | undefined> {
  if (who === "driver") {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/login')
      .set('Authorization', `Bearer ${nextAuthJWT}`)

    // console.log('Status:', response.status)
    // console.log('Headers:', response.headers)
    // console.log('Body:', response.body)

    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return response.body
  }

  else if (who === "enforcement") {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/login')
      .send({
        email: 'enforcer1@outlook.com',
        password: 'password1',
      })

    if (response.status !== 200) {
      throw new Error(`Enforcement login failed with status ${response.status}`)
    }

    return response.body.id

  } else {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/login')
      .send(adminUser)

    // console.log('Status:', response.status)
    // console.log('Headers:', response.headers)
    // console.log('Body:', response.body)

    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return response.body?.id
  }
}

const getVehiclequery = `
      query {
        myVehicles {
          id
          plate
          country
          state
        }
      }
    `
const regVehicleQuery = `
mutation RegisterVehicle($input: RegisterVehicleInput!) {
  registerVehicle(input: $input) {
    id
    plate
    country
    state
    nickname
  }
}`

const updateVehicleQuery = `
mutation UpdateVehicle($input: UpdateVehicleInput!) {
  updateVehicle(input: $input) {
    id
    plate
    country
    state
    nickname
  }
}`

const findByPlateQuery = `
query findVehicleByPlate($plate: String!) {
  findVehicleByPlate(plate: $plate) {
    id
    plate
    country
    state
    nickname
  }
}`

const checkVehicleIDQuery = `
query checkForVehicleID($vehicleID: String!) {
  checkForVehicleID(vehicleID: $vehicleID) {
    id
    plate
    country
    state
    nickname
  }
}`

const getVehicleByUserIdQuery = `
query GetVehicleByUserId($userID: String!) {
  getVehicleByUserId(userID: $userID) {
    id
  }
}`

const vehicleInput = {
  input: {
    plate: "TEST123",
    country: "US",
    state: "California",
    nickname: "Test Vehicle"
  }
}

const findByPlateInput = {
  plate: "TEST123"
}

const findOrCreateVehicleByPlateMutation = `
mutation FindOrCreateVehicleByPlate($plate: String!) {
  findOrCreateVehicleByPlate(plate: $plate) {
    id
    plate
    country
    state
  }
}`

test('Enforcer can find or create vehicle by plate', async () => {
  const token = await loginAs("enforcement")

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: findOrCreateVehicleByPlateMutation,
      variables: { plate: "ENF456" }
    })

  expect(response.body.data.findOrCreateVehicleByPlate.plate).toBe("ENF456")
})

test('Enforcer does not create duplicate vehicle if plate exists', async () => {
  const token = await loginAs("enforcement")

  const first = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: findOrCreateVehicleByPlateMutation,
      variables: { plate: "DUPLICATE123" }
    })

  const vehicleId1 = first.body.data.findOrCreateVehicleByPlate.id

  const second = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: findOrCreateVehicleByPlateMutation,
      variables: { plate: "DUPLICATE123" }
    })

  const vehicleId2 = second.body.data.findOrCreateVehicleByPlate.id

  expect(vehicleId1).toBe(vehicleId2)
})

test('Fails when plate input is missing', async () => {
  const token = await loginAs("enforcement")

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: findOrCreateVehicleByPlateMutation,
      variables: {}
    })

  expect(response.body.errors).toBeDefined()
})

test('Non-Driver cannot get a list of their vehicles', async () => {
  const token = await loginAs("admin")
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: getVehiclequery })
    .expect(200)
  expect(response.body.errors.length).toBeGreaterThan(0)
})

test('Driver can get a list of their vehicles', async () => {
    const token = await loginAs("driver")

    const response = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: getVehiclequery })
      .expect(200)

    expect(response.body.data.myVehicles.length).toBe(0)
  })

  test('Cannot get a list of vehicles without auth', async () => {
    const response = await supertest(server)
      .post('/graphql')
      .send({ query: getVehiclequery })
      .expect(200)
  
    expect(response.body.errors).toBeDefined()
  })
  

  test('Driver can register a vehicle', async () => {
    const token = await loginAs("driver")

    await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ 
        query: regVehicleQuery,
        variables: vehicleInput
      })

    const listResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: getVehiclequery })

    expect(listResponse.body.data.myVehicles[0].plate).toBe("TEST123")
  })

  test('Driver can update a vehicle', async () => {
    const token = await loginAs("driver")

    const veh = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ 
        query: regVehicleQuery,
        variables: vehicleInput
      })
    const vID = veh.body.data.registerVehicle.id
    const newUpdate = {
      input: {
        "id": vID,
        "state": "Texas",
        "country": "US",
        "nickname": "Test Vehicle"
      }
    }
    await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ 
        query: updateVehicleQuery,
        variables: newUpdate
      })

    const listResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: getVehiclequery })

    expect(listResponse.body.data.myVehicles[0].state).toBe("Texas")
  })

  test('Admin can find a vehicle using plate', async () => {
    const userToken = await loginAs("driver")
    const token = await loginAs("admin")

    await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ 
        query: regVehicleQuery,
        variables: vehicleInput
      })
    
    const listResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: findByPlateQuery,
        variables: findByPlateInput
       })

    expect(listResponse.body.data.findVehicleByPlate.plate).toBe("TEST123")
  })
  
  test('Admin can find a vehicle using VehicleID', async () => {
    const userToken = await loginAs("driver")
    const token = await loginAs("admin")

    const res = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + userToken)
      .send({ 
        query: regVehicleQuery,
        variables: vehicleInput
      })
    const vID = res.body.data.registerVehicle.id
    const listResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: checkVehicleIDQuery,
        variables: {vehicleID: vID}
       })
       
    expect(listResponse.body.data.checkForVehicleID.plate).toBe("TEST123")
  })

  test('Admin can find a VehicleID using userID', async () => {
    // const token = await loginAs("admin")

    const listResponse = await supertest(server)
      .post('/graphql')
      // .set('Authorization', 'Bearer ' + token)
      .send({ query: getVehicleByUserIdQuery,
        variables: {userID: validDriverJWT}
       })
    expect(listResponse.body.data.getVehicleByUserId.length).toBe(1)
  })