import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-ignore

import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { app as VehicleApp, bootstrap as VehicleBoot } from '../../VehicleService/src/app'
import {app as EmailApp } from '../../EmailService/src/app'
import { app as AdminApp, bootstrap as AdminBoot } from '../../AdminService/src/app'
import { SignJWT,/* JWTPayload */} from 'jose'
import { Ticket } from '../src/ticket/schema'

let server: http.Server // Ticket
let authServer: http.Server
let vehicleServer: http.Server
let emailServer: http.Server
let adminServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

const VEHICLE_PORT = 4001
const EMAIL_PORT = 3015
// const VEHICLE_SERVICE_URL = `http://localhost:${VEHICLE_PORT}`

const ADMIN_PORT = 4002
// const ADMIN_SERVICE_URL = `http://localhost:${ADMIN_PORT}`

const jwtKey = new TextEncoder().encode(process.env.JWT_SECRET)
const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

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

  adminServer = http.createServer(AdminApp)
  await new Promise<void>((resolve) => {
    adminServer.listen(ADMIN_PORT, () => resolve())
  })
  await AdminBoot()

  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
  vehicleServer.close()
  emailServer.close()
  adminServer.close()

})

async function encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
}

const UCSCRegistrar = {
  name: "UCSC Registrar",
  email: "registar@ucsc.com", 
  role: "registrar"
}

const UCSDRegistrar = {
  name: "UCSD Registrar",
  email: "registar@ucsd.com", 
  role: "registrar"
}

const UCBRegistrar = {
  name: "UCB Registrar",
  email: "registar@ucb.com", 
  role: "registrar"
}

async function loginAs(who: string, APIData=UCBRegistrar): Promise<string | undefined> {
  if (who === "driver") {
    const token = await  new SignJWT(driver)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(jwtKey)

    // Sign up
    await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/signup')
      .send({ authToken: token })


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

    const derikVehicleInput = {
      input: {
        plate: "DERIK123",
        country: "US",
        state: "California",
        nickname: "Derik's Vehicle"
      }
    }

    // Add Vehicle
    await supertest(vehicleServer)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ 
        query: regVehicleQuery,
        variables: derikVehicleInput
      })
    
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

  } else if (who === "registrar") {
    const adminToken = await loginAs("admin")

    const addOrgMutation = `
      mutation AddAPIUser($organization: APICredential!) {
        addAPIUser(organization: $organization) {
          id
        }
      }
    `

    const addResponse = await supertest(adminServer)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ 
        query: addOrgMutation,
        variables: { organization: APIData }
      })
      .expect(200)
    return addResponse.body.data.addAPIUser.id
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

const driver = {
  type: "OauthUserData",
  'name': 'Ronak Patel',
  'email': 'roapatel@ucsc.edu',
  'picture': 'https://www.google.com/img',
  'sub': '12345678',
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

test('Admin can get all tickets', async () => {
  // console.log('jwt: ', await encryptObj(driver))
  const token = await loginAs("admin")

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
  expect(response.body.data.getTickets.length).toBe(10)
})

test('Admin can modify a ticket with images', async () => {
  const enforceToken = await loginAs("enforcement")
  const adminToken = await loginAs("admin")

  const createVariables = {
    input: {
      plate: "Some Plate",
      state: "California",
      reason: "Blocking Driveway",
      note: "Parked right in front of gate",
      images: "https://example.com/photo.jpg",
    },
  }

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforceToken)
    .send({ query: createNewTicketMutation, variables: createVariables })
    .expect(200)

  expect(createResponse.body.errors).toBeUndefined()
  const ticketId = createResponse.body.data.createNewTicket.id

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
    .set('Authorization', 'Bearer ' + adminToken)
    .send({ query: modifyQuery, variables: modifyVariables })
    .expect(200)

  // console.log(modifyResponse.body.data.modifyTicket)
  expect(modifyResponse.body.errors).toBeUndefined()
  expect(modifyResponse.body.data.modifyTicket.fine).toBe(200)
  expect(modifyResponse.body.data.modifyTicket.violation).toBe("illegal parking")
  expect(modifyResponse.body.data.modifyTicket.images).toBe("photo2.jpg")
})

test('Admin can delete a ticket', async () => {
  const adminToken = await loginAs("admin")
  const enforceToken = await loginAs("enforcement")

  const createVariables = {
    input: {
      plate: "Test Plate",
      state: "California",
      reason: "speeding",
      images: "photo1.jpg",
    },
  }

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforceToken)
    .send({ query: createNewTicketMutation, variables: createVariables })
    .expect(200)

  expect(createResponse.body.errors).toBeUndefined()
  const ticketId = createResponse.body.data.createNewTicket.id

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
    .set('Authorization', 'Bearer ' + adminToken)
    .send({ query: deleteQuery, variables: deleteVariables })
    .expect(200)

  expect(deleteResponse.body.errors).toBeUndefined()
  expect(deleteResponse.body.data.deleteTicket.id).toBeDefined()

  const getQuery = `
    query {
      getTickets {
        id
      }
    }
  `
  const getResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + adminToken)
    .send({ query: getQuery })
    .expect(200)

  expect(getResponse.body.errors).toBeUndefined()
  const ticketIds = getResponse.body.data.getTickets.map((ticket: Ticket) => ticket.id)
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
          state: "California",
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
  expect(ticket.ticketStatus).toBe("unpaid")
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
  const registrarToken = await loginAs("registrar")
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
  // console.log(response.body)
  const ticket = response.body.data.hasPendingTicket

  expect(ticket).toBeDefined()
})

test('Registrar check student with ticket successful', async () => {
  const registrarToken = await loginAs("registrar", UCSCRegistrar)
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
  // console.log(response.body)
  const ticket = response.body.data.hasPendingTicket

  expect(ticket.hasTicket).toBe(true)
})

test('Registrar check student with no ticket successful', async () => {
  const registrarToken = await loginAs("registrar", UCSDRegistrar)
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
  const driverToken = await loginAs("driver")
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + driverToken)
    .send({
      query: getMyTicketquery,
    })

  expect(response.status).toBe(200)
  // console.log(response.body.data.getMyTickets)
  const ticket = response.body.data.getMyTickets

  expect(ticket).toBeDefined()
})

test('Ticket creation sends email to vehicle owner', async () => {
  const driverToken = await loginAs("driver");

  // First register a vehicle as a driver
  const registerRes = await supertest(vehicleServer)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + driverToken)
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
          plate: "TESTPLATE123",
          country: "US",
          state: "California",
          nickname: "Test Vehicle"
        }
      }
    });

  expect(registerRes.body.errors).toBeUndefined();
  const vehicleId = registerRes.body.data.registerVehicle.id;
  expect(vehicleId).toBeDefined();

  // Get enforcement token and create ticket
  const enforcementToken = await loginAs("enforcement");

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "TESTPLATE123", // Use same plate as registered vehicle
          state: "California",
          reason: "Invalid Parking",
          note: "Test ticket for email notification",
          images: "test-photo.jpg"
        }
      }
    });

  expect(response.body.errors).toBeUndefined();
  const ticket = response.body.data.createNewTicket;

  // Verify ticket was created with correct data
  expect(ticket).toBeDefined();
  expect(ticket.violation).toBe("Invalid Parking");
  expect(ticket.fine).toBe(50);
  expect(ticket.ticketStatus).toBe("unpaid");
  expect(ticket.note).toBe("Test ticket for email notification");
});

test('Admin can get ticket stats grouped by day', async () => {
  const token = await loginAs("admin");

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

test('Admin can get tickets issued by a specific enforcer', async () => {
  const token = await loginAs("admin");

  const query = `
    query GetTicketsPerDayFromEnforcer($enforcerID: String!) {
      getTicketsPerDayFromEnforcer(enforcerID: $enforcerID) {
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

  const enforcerid = await encrypt('431b3711-73bb-4c90-afcf-59116217c0db')
  const variables = { enforcerID: enforcerid };
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query, variables })
    .expect(200);
  
  expect(response.body.errors).toBeUndefined();
  const stats = response.body.data.getTicketsPerDayFromEnforcer;
  // console.log(stats)
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

test('Full ticket challenge flow - create, challenge, and get challenged tickets', async () => {
  // Setup - create a new ticket
  const enforcementToken = await loginAs("enforcement");
  const ronakDriverToken = await loginAs("driver");
  
  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "TEST123",
          state: "California",
          reason: "Invalid Parking",
          note: "Vehicle in no parking zone",
          images: "https://example.com/photo.jpg"
        }
      }
    });

  expect(createResponse.status).toBe(200);
  const ticket = createResponse.body.data.createNewTicket;
  expect(ticket.ticketStatus).toBe("unpaid");

  // Challenge the ticket
  const challengeMutation = `
    mutation ChallengeTicket($ticketID: TicketInput!, $reason: String!) {
      challengeTicket(ticketID: $ticketID, challengeReason: $reason) {
        id
        ticketStatus
        challengeReason
      }
    }
  `;

  const challengeResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + ronakDriverToken)
    .send({
      query: challengeMutation,
      variables: {
        ticketID: { id: ticket.id },
        reason: "I had a valid permit"
      }
    });

  expect(challengeResponse.status).toBe(200);
  const challengedTicket = challengeResponse.body.data.challengeTicket;
  expect(challengedTicket.ticketStatus).toBe("challenged");
  expect(challengedTicket.challengeReason).toBe("I had a valid permit");

  // Get all challenged tickets
  const getChallengedQuery = `
    query {
      getChallengedTickets {
        id
        ticketStatus
        challengeReason
      }
    }
  `;

  const getChallengedResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({ query: getChallengedQuery });

  expect(getChallengedResponse.status).toBe(200);
  const challengedTickets = getChallengedResponse.body.data.getChallengedTickets;
  expect(challengedTickets).toBeDefined();
  expect(challengedTickets.length).toBeGreaterThan(0);
  
  // Verify our challenged ticket is in the list
  const foundTicket = challengedTickets.find((t: any) => t.id === ticket.id);
  expect(foundTicket).toBeDefined();
  expect(foundTicket.ticketStatus).toBe("challenged");
  expect(foundTicket.challengeReason).toBe("I had a valid permit");
});

test('Admin can accept a ticket challenge', async () => {
  // First create and challenge a ticket
  const enforcementToken = await loginAs("enforcement");
  const ronakDriverToken = await loginAs("driver");
  // Create ticket
  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "TEST456",
          state: "California",
          reason: "Invalid Parking",
          note: "Vehicle in reserved spot",
          images: "photo.jpg"
        }
      }
    });

  const ticket = createResponse.body.data.createNewTicket;
  
  // Challenge the ticket
  const challengeMutation = `
    mutation ChallengeTicket($ticketID: TicketInput!, $reason: String!) {
      challengeTicket(ticketID: $ticketID, challengeReason: $reason) {
        id
        ticketStatus
      }
    }
  `;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + ronakDriverToken)
    .send({
      query: challengeMutation,
      variables: {
        ticketID: { id: ticket.id },
        reason: "I had a valid permit"
      }
    });

  // Accept the challenge
  const adminToken = await loginAs("admin");
  const acceptMutation = `
    mutation AcceptChallenge($ticketID: TicketInput!) {
      acceptTicketChallenge(ticketID: $ticketID) {
        id
        ticketStatus
      }
    }
  `;

  const acceptResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + adminToken)
    .send({
      query: acceptMutation,
      variables: {
        ticketID: { id: ticket.id }
      }
    });

  expect(acceptResponse.status).toBe(200);
  expect(acceptResponse.body.errors).toBeUndefined();
  const acceptedTicket = acceptResponse.body.data.acceptTicketChallenge;
  expect(acceptedTicket.ticketStatus).toBe("accepted");
});

test('Admin can get accepted tickets', async () => {
  // First create and accept a ticket challenge to ensure we have accepted tickets
  const enforcementToken = await loginAs("enforcement")
  const ronakDriverToken = await loginAs("driver")
  // Create ticket
  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "TEST456",
          state: "California",
          reason: "Invalid Parking",
          note: "Vehicle in reserved spot",
          images: "photo.jpg"
        }
      }
    });

  const ticket = createResponse.body.data.createNewTicket;
  
  // Challenge the ticket
  const challengeMutation = `
    mutation ChallengeTicket($ticketID: TicketInput!, $reason: String!) {
      challengeTicket(ticketID: $ticketID, challengeReason: $reason) {
        id
        ticketStatus
      }
    }
  `;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + ronakDriverToken)
    .send({
      query: challengeMutation,
      variables: {
        ticketID: { id: ticket.id },
        reason: "I had a valid permit"
      }
    });

  // Accept the challenge
  const adminToken = await loginAs("admin");
  const acceptMutation = `
    mutation AcceptChallenge($ticketID: TicketInput!) {
      acceptTicketChallenge(ticketID: $ticketID) {
        id
        ticketStatus
      }
    }
  `;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + adminToken)
    .send({
      query: acceptMutation,
      variables: {
        ticketID: { id: ticket.id }
      }
    });

  // Get accepted tickets
  const getAcceptedQuery = `
    query {
      getAcceptedTickets {
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
  `;

  const getAcceptedResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + adminToken)
    .send({ query: getAcceptedQuery });

  expect(getAcceptedResponse.status).toBe(200);
  expect(getAcceptedResponse.body.errors).toBeUndefined();
  const acceptedTickets = getAcceptedResponse.body.data.getAcceptedTickets;
  expect(acceptedTickets).toBeDefined();
  expect(acceptedTickets.length).toBeGreaterThan(0);
  
  // Verify ticket properties
  acceptedTickets.forEach((ticket: any) => {
    expect(ticket.ticketStatus).toBe("accepted");
    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('vehicle');
    expect(ticket).toHaveProperty('enforcer');
    expect(ticket).toHaveProperty('issuedDate');
    expect(ticket).toHaveProperty('violation');
    expect(ticket).toHaveProperty('fine');
    expect(ticket).toHaveProperty('images');
    expect(ticket).toHaveProperty('note');
  });
});

test('Admin can reject a ticket challenge', async () => {
  const enforcementToken = await loginAs("enforcement")
  const ronakDriverToken = await loginAs("driver")

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "REJECT123",
          state: "California",
          reason: "Fire Lane",
          note: "Blocking fire lane",
          images: "reject-photo.jpg"
        }
      }
    });

  const ticket = createResponse.body.data.createNewTicket;

  const challengeMutation = `
    mutation ChallengeTicket($ticketID: TicketInput!, $reason: String!) {
      challengeTicket(ticketID: $ticketID, challengeReason: $reason) {
        id
        ticketStatus
      }
    }
  `;

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + ronakDriverToken)
    .send({
      query: challengeMutation,
      variables: {
        ticketID: { id: ticket.id },
        reason: "I was not blocking"
      }
    });

  const adminToken = await loginAs("admin");
  const rejectMutation = `
    mutation RejectChallenge($ticketID: TicketInput!) {
      rejectTicketChallenge(ticketID: $ticketID) {
        id
        ticketStatus
      }
    }
  `;

  const rejectResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + adminToken)
    .send({
      query: rejectMutation,
      variables: {
        ticketID: { id: ticket.id }
      }
    });

  expect(rejectResponse.status).toBe(200);
  expect(rejectResponse.body.errors).toBeUndefined();
  const rejectedTicket = rejectResponse.body.data.rejectTicketChallenge;
  expect(rejectedTicket.ticketStatus).toBe("unpaid");
  expect(rejectedTicket.id).toBe(ticket.id);
});

test('Driver can mark a ticket as paid', async () => {
  const enforcementToken = await loginAs("enforcement");
  const ronakDriverToken = await loginAs("driver");
  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "PAID123",
          state: "California",
          reason: "Expired Permit",
          note: "Permit expired last month",
          images: "paid-photo.jpg"
        }
      }
    });

  expect(createResponse.status).toBe(200);
  const ticket = createResponse.body.data.createNewTicket;
  expect(ticket).toBeDefined();

  const markPaidMutation = `
    mutation MarkTicketAsPaid($input: PaidTicketInput!) {
      markTicketAsPaid(input: $input) {
        id
        ticketStatus
      }
    }
  `;

  const markPaidResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + ronakDriverToken)
    .send({
      query: markPaidMutation,
      variables: {
        input: { id: ticket.id }
      }
    });

  expect(markPaidResponse.status).toBe(200);
  expect(markPaidResponse.body.errors).toBeUndefined();
  const paidTicket = markPaidResponse.body.data.markTicketAsPaid;
  expect(paidTicket).toBeDefined();
  // expect(paidTicket.id).toBe(ticket.id);
  expect(paidTicket.ticketStatus).toBe('paid');
});

test('Admin can get unpaid tickets', async () => {
  const adminToken = await loginAs("admin");

  // Create two unpaid tickets for today
  const enforcementToken = await loginAs("enforcement");
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "UNPAID1",
          state: "California",
          reason: "No Permit",
          note: "No permit displayed",
          images: "unpaid1.jpg"
        }
      }
    });

  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + enforcementToken)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "UNPAID2",
          state: "California",
          reason: "Expired Permit",
          note: "Permit expired",
          images: "unpaid2.jpg"
        }
      }
    });

  const getUnpaidTicketsQuery = `
    mutation {
      getUnpaidTickets {
          vehicle
          violation
          fine
          note
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + adminToken)
    .send({ query: getUnpaidTicketsQuery });

  expect(response.status).toBe(200);
  expect(response.body.errors).toBeUndefined();
  const result = response.body.data.getUnpaidTickets;
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});

test('Admin can get ticket report via adminTicketReport', async () => {
  const token = await loginAs("admin");

  const query = `
    query AdminTicketReport($numDays: Float) {
      adminTicketReport(numDays: $numDays) {
        totalTickets
        unpaidTickets
        paidTickets
        totalRevenue
        violationBreakdown {
          violation
          count
        }
        enforcerBreakdown {
          enforcer
          count
        }
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query, variables: { numDays: 7 } })
    .expect(200);

  expect(response.body.errors).toBeUndefined();
  const report = response.body.data.adminTicketReport;
  expect(report).toBeDefined();
  expect(report).toHaveProperty('totalTickets');
  expect(report).toHaveProperty('unpaidTickets');
  expect(report).toHaveProperty('paidTickets');
  expect(report).toHaveProperty('totalRevenue');
  expect(Array.isArray(report.violationBreakdown)).toBe(true);
  expect(Array.isArray(report.enforcerBreakdown)).toBe(true);
});

test('Plate with ticket is returned by getPlateWithTicket', async () => {
  const t1 = await loginAs("driver");
  const t2 = await loginAs("enforcement");
  await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + t2)
    .send({
      query: createNewTicketMutation,
      variables: {
        input: {
          plate: "DERIK123",
          state: "California",
          reason: "Test Ticket",
          note: "This is a test ticket",
          images: "test-image.jpg"
        }
      }
    });
    

    const query = `
    query GetPlateWithTicket($plate: String!, $state: String!) {
      pendingTickets(plate: $plate, state: $state) {
        id
        vehicle
      }
    }
  `;
  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + t1)
    .send({
      query,
      variables: { plate: "DERIK123", state: "California" }
    })
  expect(response.status).toBe(200);
  expect(response.body.errors).toBeUndefined();
  const tickets = response.body.data.pendingTickets;
  expect(tickets.length).toBe(1);
})