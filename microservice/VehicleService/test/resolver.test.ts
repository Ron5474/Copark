import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import {app as ticketApp, bootstrap as ticketBootstrap} from '../../TicketService/src/app'
import {app as permitApp, bootstrap as permitBootstrap} from '../../PermitService/src/app'
import { SignJWT } from 'jose'


let server: http.Server
let authServer: http.Server
let ticketServer: http.Server
let permitServer: http.Server

const VEHICLE_PORT = 4001

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`
const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)
const internalKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

const TICKET_PORT = 4002
// const TICKET_SERVICE_URL = `http://localhost:${TICKET_PORT}`

const PERMIT_PORT = 4003
// const PERMIT_SERVICE_URL = `http://localhost:${PERMIT_PORT}`

beforeAll(async () => {
  // Start your GraphQL server
  server = http.createServer(app)
  server.listen(VEHICLE_PORT)
  await bootstrap()

  // Start your Auth server
  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => {
      resolve()
    })
  })

  // Start your Ticket server
  ticketServer = http.createServer(ticketApp)
  await new Promise<void>((resolve) => {
    ticketServer.listen(TICKET_PORT, () => {
      resolve()
    })
  })
  await ticketBootstrap()

  // Start your Permit server
  permitServer = http.createServer(permitApp)
  await new Promise<void>((resolve) => {
    permitServer.listen(PERMIT_PORT, () => {
      resolve()
    })
  })
  await permitBootstrap()

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

async function loginAs(who: string, defaultVehicle=true): Promise<string | undefined> {
  if (who === "driver") {
    const token = await  new SignJWT(driver)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)

    // Sign up
    await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/signup')
      .send({ authToken: token })

    // Add Vehicle
    const addVehicle = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ 
        query: regVehicleQuery,
        variables: derikVehicleInput
      })

    const id = addVehicle.body.data.registerVehicle.id
    const setDefaultVehicleInput = {
      input: {
        id: id
      }
    }
    if (defaultVehicle) {
      await supertest(server)
        .post('/graphql')
        .set('Authorization', 'Bearer ' + token)
        .send({ 
          query: SetDefaultVehicle,
          variables: setDefaultVehicleInput
        })
    }
    
    const response = await supertest(AUTH_SERVICE_URL)
      .put('/api/v0/auth/driver/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({newState: 'complete'})

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
          nickname
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

const SetDefaultVehicle = `
mutation SetDefaultVehicle($input: setDefaultVehicleInput!) {
  setDefaultVehicle(input: $input) {
    id
  }
}`

const getDefaultVehiclequery = `
  query {
    getDefaultVehicle {
      id
      plate
    }
  }
`


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
query findVehicleByPlate($plate: String!, $state: String!) {
  findVehicleByPlate(plate: $plate, state: $state) {
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
  plate: "TEST123",
  state: "California"
}

const findOrCreateVehicleByPlateMutation = `
mutation FindOrCreateVehicleByPlate($plate: String!, $state: String!) {
  findOrCreateVehicleByPlate(plate: $plate, state: $state) {
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
      variables: { plate: "ENF456", state: "CA" }
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
      variables: { plate: "DUPLICATE123", state: "CA" }
    })

  const vehicleId1 = first.body.data.findOrCreateVehicleByPlate.id

  const second = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: findOrCreateVehicleByPlateMutation,
      variables: { plate: "DUPLICATE123", state: "CA" }
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
      variables: { plate: "NULLCHECK456", state: "CA" }
    })

  const vehicle = response.body.data.findOrCreateVehicleByPlate
  expect(vehicle.country).toBeNull()
  expect(vehicle.state).toBe("CA")
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

test('Driver can get a Default Vehicle', async () => {
  const token = await loginAs("driver")
    const response = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: getDefaultVehiclequery })
      .expect(200)

    expect(response.body.data.getDefaultVehicle).toBeDefined()
})

test('Driver can get a list of their vehicles', async () => {
  const token = await loginAs("driver")
    const response = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: getVehiclequery })
      .expect(200)

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
    const token = await loginAs("driver", false)

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
        "nickname": "Real Vehicle"
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

    expect(listResponse.body.data.myVehicles[1].nickname).toBe("Real Vehicle")
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

test('Driver removes a vehicle', async () => {
  const token = await loginAs("driver", false)

  const veh = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: regVehicleQuery,
      variables: vehicleInput
    })

  const state = veh.body.data.registerVehicle.state
  const plate = veh.body.data.registerVehicle.plate

  expect(veh.body.data.registerVehicle.plate).toBe("TEST123")

  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: `
        mutation DeleteVehicle($plate: String!, $state: String!) {
          deleteVehicle(plate: $plate, state: $state) {
            id
          }
        }
      `,
      variables: { plate, state }
    })

  expect(deleteResponse.body.data.deleteVehicle).toHaveProperty('id')
})

test('Driver cannot delete a vehicle without plate and state', async () => {
  const token = await loginAs("driver", false)

  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: `
        mutation DeleteVehicle($plate: String!, $state: String!) {
          deleteVehicle(plate: $plate, state: $state) {
            id
          }
        }
      `,
      variables: { plate: "", state: "" }
    })

  expect(deleteResponse.body.errors.length).toBe(1)
  expect(deleteResponse.body.errors[0].message).toBe("Plate and state is required")
})