import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-ignore

import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { app as VehicleApp, bootstrap as VehicleBoot } from '../../VehicleService/src/app'
import {app as EmailApp } from '../../EmailService/src/app'
import { SignJWT,/* JWTPayload */} from 'jose'

let server: http.Server // Ticket
let authServer: http.Server
let vehicleServer: http.Server
let emailServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

const VEHICLE_PORT = 4001
const EMAIL_PORT = 3015
// const VEHICLE_SERVICE_URL = `http://localhost:${VEHICLE_PORT}`

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
const registrarToken = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImU1YzU5MmVkLTJhNGEtNDViOS05ODAyLWM3MGM2OTE0YzZmZCIsImlhdCI6MTc0NzI2ODk2NCwiZXhwIjoxOTA1MDU2OTY0fQ.aJnD-aYMd53RNCKmBOHBHFOxmFRzGYEqBFScmzMNpeE"
const ronakDriverToken = "eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiUm9uYWsgUGF0ZWwiLCJlbWFpbCI6InJvYXBhdGVsQHVjc2MuZWR1IiwicGljdHVyZSI6Imh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vaW1nIiwic3ViIjoiMTIzNDU2NzgiLCJpYXQiOjE3NDcyNzI2NjksImV4cCI6MTkwNTA2MDY2OX0.Mlas0IqbxpF893s6A8JycOIYX1tG3bNbC72PhghEZ_0"

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

// const driverUser = {
//   email: 'staticdriver1@outlook.com',
//   password: 'password1',
// }

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => resolve())
  })

  vehicleServer = http.createServer(VehicleApp)
  await new Promise<void>((resolve) => {
    vehicleServer.listen(VEHICLE_PORT, () => resolve())
  })
  await VehicleBoot()

  emailServer = http.createServer(EmailApp);
  await new Promise<void>((resolve) => {
    emailServer.listen(EMAIL_PORT, () => resolve());
  });

  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
  vehicleServer.close();
  emailServer.close();
})

async function encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  }


// async function encryptObj(user: JWTPayload): Promise<string> {
//   return new SignJWT(user)
//     .setProtectedHeader({ alg: 'HS256' })
//     .setIssuedAt()
//     .setExpirationTime('5y')
//     .sign(encodedKey)
// }


async function loginAsAdmin(): Promise<string> {
  const response = await supertest(AUTH_SERVICE_URL)
    .post('/api/v0/auth/login')
    .send(adminUser)

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}`)
  }

  return response.body.id
}

// async function loginAsDriver(): Promise<string> {
//   const response = await supertest(AUTH_SERVICE_URL)
//     .post('/api/v0/auth/login')
//     .send(driverUser)

//   if (response.status !== 200) {
//     throw new Error(`Login failed with status ${response.status}`)
//   }

//   return response.body.id
// }

test('Admin can create a ticket with images', async () => {
  const token = await loginAsAdmin()

  const vehicleid = '00000000-0000-0000-0000-000000000000'
  const enforcerid = await encrypt('00000000-0000-0000-0000-000000000000')

  const query = `
    mutation CreateTicket($input: NewTicket!) {
      createTicket(newTicket: $input) {
        id
        vehicle
        fine
        violation
        images
      }
    }
  `

  const variables = {
    input: {
      vehicle: vehicleid,
      enforcer: enforcerid,
      fine: 150,
      violation: "speeding",
      images: "photo1.jpg",
    },
  }

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query, variables })
    .expect(200)

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.createTicket.images).toBe("photo1.jpg")
})

const driver = {
  'name': 'Ronak Patel',
  'email': 'roapatel@ucsc.edu',
  'picture': 'https://www.google.com/img',
  'sub': '12345678',
}

test('Admin can get all tickets', async () => {
  // console.log('jwt: ', await encryptObj(driver))
  const token = await loginAsAdmin()

  const query = `
    query {
      getTickets {
        id
        vehicle
        enforcer
        fine
        violation
        images
      }
    }
  `

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query })
    .expect(200)

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.getTickets.length).toBe(9)
})

test('Admin can modify a ticket with images', async () => {
  const token = await loginAsAdmin()

  const vehicleid = '00000000-0000-0000-0000-000000000001'
  const enforcerid = await encrypt('00000000-0000-0000-0000-000000000002')

  const createQuery = `
    mutation CreateTicket($input: NewTicket!) {
      createTicket(newTicket: $input) {
        id
        vehicle
        fine
        violation
        images
      }
    }
  `

  const createVariables = {
    input: {
      vehicle: vehicleid,
      enforcer: enforcerid,
      fine: 150,
      violation: "speeding",
      images: "photo1.jpg",
    },
  }

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: createQuery, variables: createVariables })
    .expect(200)

  expect(createResponse.body.errors).toBeUndefined()
  const ticketId = createResponse.body.data.createTicket.id

  const modifyQuery = `
    mutation ModifyTicket($input: ModifyTicketInput!) {
      modifyTicket(input: $input) {
        id
        vehicle
        enforcer
        fine
        violation
        ticketStatus
        images
      }
    }
  `

  const modifyVariables = {
    input: {
      id: ticketId,
      fine: 200,
      violation: "illegal parking",
      ticketStatus: "resolved",
      images: "photo2.jpg",
    },
  }  

  const modifyResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: modifyQuery, variables: modifyVariables })
    .expect(200)

  // console.log(modifyResponse.body.data.modifyTicket)
  expect(modifyResponse.body.errors).toBeUndefined()
  expect(modifyResponse.body.data.modifyTicket.fine).toBe(200)
  expect(modifyResponse.body.data.modifyTicket.violation).toBe("illegal parking")
  expect(modifyResponse.body.data.modifyTicket.images).toBe("photo2.jpg")
})

test('Admin can delete a ticket', async () => {
  const token = await loginAsAdmin()

  const vehicleid = '00000000-0000-0000-0000-000000000000'
  const enforcerid = await encrypt('00000000-0000-0000-0000-000000000000')

  const createQuery = `
    mutation CreateTicket($input: NewTicket!) {
      createTicket(newTicket: $input) {
        id
        vehicle
        fine
        violation
        images
      }
    }
  `

  const createVariables = {
    input: {
      vehicle: vehicleid,
      enforcer: enforcerid,
      fine: 150,
      violation: "speeding",
      images: "photo1.jpg",
    },
  }

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: createQuery, variables: createVariables })
    .expect(200)

  expect(createResponse.body.errors).toBeUndefined()
  const ticketId = createResponse.body.data.createTicket.id

  const deleteQuery = `
    mutation DeleteTicket($id: TicketInput!) {
      deleteTicket(id: $id) {
        id
      }
    }
  `

  const deleteVariables = {
    id: {
      id: ticketId,
    },
  }
  
  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: deleteQuery, variables: deleteVariables })
    .expect(200)

  expect(deleteResponse.body.errors).toBeUndefined()
  expect(deleteResponse.body.data.deleteTicket.id).toBe(ticketId)

  const getQuery = `
    query {
      getTickets {
        id
      }
    }
  `

  const getResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: getQuery })
    .expect(200)

  expect(getResponse.body.errors).toBeUndefined()
  const ticketIds = getResponse.body.data.getTickets.map((ticket: any) => ticket.id)
  expect(ticketIds).not.toContain(ticketId)
})

// test('Driver can get their tickets', async () => {
//   const token = await loginAsDriver()

//   const query = `
//     query {
//       getMyTickets {
//         id
//         vehicle
//         fine
//         violation
//         images
//       }
//     }
//   `

//   const response = await supertest(server)
//     .post('/graphql')
//     .set('Authorization', 'Bearer ' + token)
//     .send({ query })
//     .expect(200)

//   console.log(response.body)
//   expect(response.body.errors).toBeUndefined()
//   expect(response.body.data.getMyTickets.length).toBe(3)
// })

async function loginAs(who: string): Promise<string> {
  if (who === "enforcement") {
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
  }

  throw new Error("Unsupported user role")
}

const createNewTicketMutation = `
mutation CreateNewTicket($input: NewTicketInput!) {
  createNewTicket(input: $input) {
    id
    vehicle
    enforcer
    issuedDate
    violation
    fine
    ticketStatus
    images
    note
  }
}
`

test('Enforcer can create a ticket', async () => {
  const token = await loginAs("enforcement")

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "TICKET123",
          reason: "Blocking Driveway",
          note: "Parked right in front of gate",
          images: "https://example.com/photo.jpg"
        }
      }
    })

  expect(response.status).toBe(200)
  // console.log(response.body.data)
  const ticket = response.body.data.createNewTicket

  expect(ticket).toBeDefined()
  expect(ticket.violation).toBe("Blocking Driveway")
  expect(ticket.fine).toBe(50)
  expect(ticket.ticketStatus).toBe("active")
  expect(ticket.images).toBe("https://example.com/photo.jpg")
  expect(ticket.note).toBe("Parked right in front of gate")
})

const registrarQuery = `
query CheckPendingTicket($email: EmailInput!) {
  hasPendingTicket(email: $email) {
    hasTicket
  }
}`

test('Registrar check if non-existent student has ticket', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + registrarToken)
    .send({
      query: registrarQuery,
      variables: {
        email: {
          email: "fake@user.com"
        }
      }
    })

  expect(response.status).toBe(200)
  // console.log(response.body.data)
  const ticket = response.body.data.hasPendingTicket

  expect(ticket).toBeDefined()
})

test('Registrar check student with ticket successful', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + registrarToken)
    .send({
      query: registrarQuery,
      variables: {
        email: {
          email: "roapatel@ucsc.edu"
        }
      }
    })

  expect(response.status).toBe(200)
  // console.log(response.body.data)
  const ticket = response.body.data.hasPendingTicket

  expect(ticket.hasTicket).toBe(true)
})

test('Registrar check student with no ticket successful', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + registrarToken)
    .send({
      query: registrarQuery,
      variables: {
        email: {
          email: "bcoliver@ucsc.edu"
        }
      }
    })

  expect(response.status).toBe(200)
  // console.log(response.body.data)
  const ticket = response.body.data.hasPendingTicket

  expect(ticket.hasTicket).toBe(false)
})

const getMyTicketquery = `
    query {
      getMyTickets {
        id
        vehicle
        enforcer
        fine
        violation
        images
      }
    }
  `


test('Student can check their tickets successful', async () => {
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + ronakDriverToken)
    .send({
      query: getMyTicketquery,
    })

  expect(response.status).toBe(200)
  // console.log(response.body.data.getMyTickets)
  const ticket = response.body.data.getMyTickets

  expect(ticket).toBeDefined()
})

test('Ticket creation sends email to vehicle owner', async () => {

  const registerRes = await supertest(vehicleServer)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + ronakDriverToken)
    .send({
      query: `
        mutation RegisterVehicle($input: RegisterVehicleInput!) {
          registerVehicle(input: $input) {
            id
            plate
          }
        }
      `,
      variables: {
        input: {
          plate: "Coder123",
          country: "US",
          state: "California",
          nickname: "Batmobile"
        }
      }
    });

  expect(registerRes.status).toBe(200);

  const vehicleId = registerRes.body.data.registerVehicle.id;

  expect(vehicleId).toBeDefined();

  const enforcementToken = await loginAs("enforcement")

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "Coder123",
          reason: "Being Smart",
          note: "#1 in commits",
          images: "https://example.com/photo.jpg"
        }
      }
    })

  expect(response.status).toBe(200)

  const ticket = response.body.data.createNewTicket

  expect(ticket).toBeDefined()
  expect(ticket.violation).toBe("Being Smart")
  expect(ticket.fine).toBe(50)
  expect(ticket.note).toBe("#1 in commits")
})

test('Admin can get ticket stats grouped by day', async () => {
  const token = await loginAsAdmin();

  const query = `
    query {
      getTicketsStats{
        date
        tickets {
          id
          vehicle
          enforcer
          issuedDate
          violation
          fine
          ticketStatus
          images
          note
        }
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query })
    .expect(200);

  expect(response.body.errors).toBeUndefined();
  const stats = response.body.data.getTicketsStats;
  expect(Array.isArray(stats)).toBe(true);
  expect(stats.length).toBeGreaterThan(0);
  stats.forEach((dayStat: any) => {
    expect(dayStat).toHaveProperty('date');
    expect(Array.isArray(dayStat.tickets)).toBe(true);
    dayStat.tickets.forEach((ticket: any) => {
      expect(ticket).toHaveProperty('id');
      expect(ticket).toHaveProperty('vehicle');
      expect(ticket).toHaveProperty('enforcer');
      expect(ticket).toHaveProperty('issuedDate');
      expect(ticket).toHaveProperty('violation');
      expect(ticket).toHaveProperty('fine');
      expect(ticket).toHaveProperty('ticketStatus');
      expect(ticket).toHaveProperty('images');
      expect(ticket).toHaveProperty('note');
    });
  });
});

// test('Admin can get tickets issued by a specific enforcer', async () => {
//   const token = await loginAsAdmin();

//   // Create a ticket with a known enforcer
//   const enforcerid = await encrypt('00000000-0000-0000-0000-000000000002');
//   const vehicleid = '00000000-0000-0000-0000-000000000001';
//   const createQuery = `
//     mutation CreateTicket($input: NewTicket!) {
//       createTicket(newTicket: $input) {
//         id
//         enforcer
//       }
//     }
//   `;
//   const createVariables = {
//     input: {
//       vehicle: vehicleid,
//       enforcer: enforcerid,
//       fine: 100,
//       violation: "test violation",
//       images: "test.jpg",
//     },
//   };
//   const createResponse = await supertest(server)
//     .post('/graphql')
//     .set('Authorization', 'Bearer ' + token)
//     .send({ query: createQuery, variables: createVariables })
//     .expect(200);
//   expect(createResponse.body.errors).toBeUndefined();
//   const ticket = createResponse.body.data.createTicket;

//   // Now query for tickets issued by this enforcer
//   const query = `
//     query GetTicketsIssuedByEnforcer($enforcerID: String!) {
//       getTicketsIssuedByEnforcer(enforcerID: $enforcerID) {
//         id
//         enforcer
//       }
//     }
//   `;
//   const variables = { enforcerID: enforcerid };
//   const response = await supertest(server)
//     .post('/graphql')
//     .set('Authorization', 'Bearer ' + token)
//     .send({ query, variables })
//     .expect(200);
//   expect(response.body.errors).toBeUndefined();
//   const tickets = response.body.data.getTicketsIssuedByEnforcer;
//   expect(Array.isArray(tickets)).toBe(true);
//   expect(tickets.some((t: any) => t.id === ticket.id)).toBe(true);
// });