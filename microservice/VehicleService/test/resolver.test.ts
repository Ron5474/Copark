import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { SignJWT } from 'jose'


let server: http.Server
let authServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`
const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)
const internalKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

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

const driver = {
    "name": "Derik Driver",
    "email": "derik@copark.space",
    "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
    "sub": "1234567890",
  }

async function encrypt(userId: string): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5y')
    .sign(internalKey)
  }

const validDriverJWT = encrypt('b1eab387-1000-4ee3-a746-d59366e44f06');

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

async function loginAs(who: string): Promise<string | undefined> {
  if (who === "driver") {
    const token = await  new SignJWT(driver)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
    // console.log("Driver token:", token)

    // Sign up
    await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/signup')
      .send({ authToken: token })

    // console.log('Signup Status:', signupRes.status)
    // console.log('Signup Headers:', signupRes.headers)
    // console.log('Signup Body:', signupRes.body)

    // Add Vehicle
    const addVehicle = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ 
        query: regVehicleQuery,
        variables: derikVehicleInput
      })

    console.log('Add Vehicle Headers:', addVehicle.headers)
    console.log('Add Vehicle Body:', addVehicle.body)
    
    const response = await supertest(AUTH_SERVICE_URL)
      .put('/api/v0/auth/driver/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({newState: 'complete'})

    // console.log('Status:', response.status)
    // console.log('Headers:', response.headers)
    // console.log('Body:', response.body)

    const validStatuses = [200, 201, 204];
    if (!validStatuses.includes(response.status)) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return token
  } else if (who === "enforcement") {
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

const getOwnerByVehicleIdQuery = `
query FindOwnerByVehicleID($vehicleId: String!) {
  findOwnerByVehicleID(vehicle: $vehicleId) {
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

const derikVehicleInput = {
  input: {
    plate: "DERIK123",
    country: "US",
    state: "California",
    nickname: "Derik's Vehicle"
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

test('Enforcer can find Owner using VehicleID', async () => {
  const token = await loginAs("enforcement")

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: getOwnerByVehicleIdQuery,
      variables: { vehicleId: "f2d7800e-67ce-41aa-b1fe-38e679112e0e" }
    })
  expect(response.body.data.findOwnerByVehicleID.id).toBeDefined()
})

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

test('Unregistered vehicle has null fields by default', async () => {
  const token = await loginAs("enforcement")

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: findOrCreateVehicleByPlateMutation,
      variables: { plate: "NULLCHECK456" }
    })

  const vehicle = response.body.data.findOrCreateVehicleByPlate
  expect(vehicle.country).toBeNull()
  expect(vehicle.state).toBeNull()
})

test('Enforcer can directly create an unregistered vehicle', async () => {
  const token = await loginAs("enforcement")

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        mutation CreateUnregisteredVehicle($input: createdVehicleInput!) {
          createUnregisteredVehicle(input: $input) {
            id
            plate
          }
        }
      `,
      variables: {
        input: {
          plate: "COVERAGE999"
        }
      }
    })

  expect(response.body.data.createUnregisteredVehicle.plate).toBe("COVERAGE999")
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
    console.log(response.body)

    expect(response.body.data.myVehicles.length).toBe(1)
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

    expect(listResponse.body.data.myVehicles[1].plate).toBe("TEST123")
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

    expect(listResponse.body.data.myVehicles[1].state).toBe("Texas")
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
        variables: {userID: await validDriverJWT}
       })

    expect(listResponse.body.data.getVehicleByUserId.length).toBe(1)
  })