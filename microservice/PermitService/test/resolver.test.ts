import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
// @ts-expect-error: supertest types may not match expected types in this context
import supertest from 'supertest'
import * as http from 'http'
import { SignJWT } from 'jose'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { app as VehicleApp, bootstrap as VehicleBoot } from '../../VehicleService/src/app'

let server: http.Server
// eslint-disable-next-line
let authServer: any
// eslint-disable-next-line
let vehcServer: any

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`
const VEHC_PORT = 4001
// const VEHC_SERVICE_URL = `http://localhost:${VEHC_PORT}`
const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)


beforeAll(async () => {
  // Start your GraphQL server
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => resolve())
  })

  vehcServer = http.createServer(VehicleApp)
  await new Promise<void>((resolve) => {
    vehcServer.listen(VEHC_PORT, () => resolve())
  })
  await VehicleBoot()

  return db.reset()
})

beforeEach( async () => {
  return db.reset()
})

afterAll(async () => {
  await db.shutdown()
  if (server) server.close()
  if (authServer) authServer.close()
  if (vehcServer) vehcServer.close()
})

const driver = {
  "name": "Derik Driver",
  "email": "derik@copark.space",
  "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
  "sub": "1234567890",
}


// TODO update JWT with new secret
const policeJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFiZTQwNWM2LTc0MDAtNGQyMy05Zjg2LTAwZWFkMTU3MjlmNSIsImlhdCI6MTc0NzI2MzIyMSwiZXhwIjoxOTA1MDUxMjIxfQ.UVVWAjg2-asw8gfqoxljHZSVX4Mn_1FzOV85CagVbUQ"

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
    const addVehicle = await supertest(vehcServer)
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

const derikVehicleInput = {
  input: {
    plate: "DERIK123",
    country: "US",
    state: "California",
    nickname: "Derik's Vehicle"
  }
}

// const purchaseZonePermitQuery = `
// mutation PurchaseZonePermit($input: PurchaseZoneInput!) {
//   purchaseZonePermit(input: $input) {
//     type
//     area
//     purchaseDate
//     activeDate
//     expireDate
//     receipt {
//       service
//       subTotal
//       total
//     }
//     paymentMethod
//   }
// }`

// const purchaseZoneInput = {
//   input: {
//     vehicle: "12345678-1234-1234-1234-567890abcdef",
//     zone: "123",
//     duration: {'minutes': 30, 'hours': 0},
//     paymentMethod: "paypal"
//   }
// }

const checkPermitQuery = `
query CheckedPermit($plate: String!) {
  checkPermit(plate: $plate) {
    type
    area
  }
}`

const checkPermitInvalidInput = { plate: "0000000" }

const checkPermitInput = { plate: "JCDE544" }

const isValidPermitByPoliceQuery = `
query IsValidPolice($plate: String!) {
  isValidPermitByPolice(plate: $plate) {
    isValid
  }
}`

const isValidPermitByPoliceInput = {
  plate: "7RON123",
}

const nonExistentPlateInput = {
  plate: "1AAA111",
}

const myPermitsQuery = `
query MyPermits($vehicleID: String!) {
  myPermits(vehicleID: $vehicleID) {
    future {
      vehicle
      type
      area
      activeDate
      expireDate
    }
    active {
      vehicle
      type
      area
      activeDate
      expireDate
    }
    expired {
      vehicle
      type
      area
      activeDate
      expireDate
    }
  }
}`

const myPermitsInput = {
  vehicleID: "12345678-1234-1234-1234-567890abcdef"
}

const zoneDetailsQuery = `
query ZoneDetails($zone: String!) {
  zoneDetails(zone: $zone) {
    hourly
    maxDuration {
      minutes
      hours
    }
    openTime
    closeTime
  }
}`

const zoneDetailsInput = {
  zone: "123"
}

test('Permit service is running', async () => {
  const status = await supertest(server)
    .post('/graphql')
    .send({ 
      query: `
        query { permitServiceStatus }
      `,
    })

  expect(status.body.data.permitServiceStatus).toBe("Permit service is running")
})

// test('Driver can purchase a zone permit', async () => {
//   const token = await loginAs("driver")

//   const confirmation = await supertest(server)
//     .post('/graphql')
//     .set('Authorization', 'Bearer ' + token)
//     .send({ 
//       query: purchaseZonePermitQuery,
//       variables: purchaseZoneInput
//     })

//   expect(confirmation.body.data.purchaseZonePermit.type).toBe("zone")
// })

test('Enforcer gets invalid permit', async () => {
  const token = await loginAs("enforcement")

  const permits = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: checkPermitQuery,
      variables: checkPermitInvalidInput
    })
  
  expect(permits.body.data.checkPermit.length).toBe(0)
})

test('Enforcer gets valid permit', async () => {
  const token = await loginAs("enforcement")

  const permits = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: checkPermitQuery,
      variables: checkPermitInput
    })

  expect(permits.body.data.checkPermit.length).toBe(1)

})

test('Police gets invalid permit', async () => {
  const isValid = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + policeJWT)
    .send({ 
      query: isValidPermitByPoliceQuery,
      variables: isValidPermitByPoliceInput
    })

    // console.log(isValid.body)
  expect(isValid.body.data.isValidPermitByPolice.isValid).toBe(false)
})

test('Police gets invalid for nonexistent plate', async () => {
  const isValid = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + policeJWT)
    .send({ 
      query: isValidPermitByPoliceQuery,
      variables: nonExistentPlateInput
    })
    
  expect(isValid.body.data.isValidPermitByPolice.isValid).toBe(false)
})

test('Driver has no permits', async () => {
  const token = await loginAs("driver")

  const permits = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: `
        query {
          myPermits {
            future { vehicle type area activeDate expireDate }
            active { vehicle type area activeDate expireDate }
            expired { vehicle type area activeDate expireDate }
          }
        }
      `
    })

  expect(permits.body.data.myPermits.active.length).toBe(0)
})

test('Zone details', async () => {
  const token = await loginAs("driver")

  const details = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: zoneDetailsQuery,
      variables: zoneDetailsInput
    })

  expect(details.body.data.zoneDetails.hourly).toBe(2.45)
})

test('Admin can get ticket stats grouped by day', async () => {
  const token = await loginAs("admin");

  const query = `
    query GetPermitStats {
      getPermitStats {
        date
        permits {
          vehicle
          type
          area
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
  const stats = response.body.data.getPermitStats;
  expect(Array.isArray(stats)).toBe(true);
  expect(stats.length).toBeGreaterThan(0);
  stats.forEach((dayStat: { date: string; permits: { vehicle: string; area: string; activeDate: string; expireDate: string }[] }) => {
    expect(dayStat).toHaveProperty('date');
    expect(Array.isArray(dayStat.permits)).toBe(true);
    dayStat.permits.forEach((permit: { vehicle: string; area: string; activeDate: string; expireDate: string }) => {
      expect(permit).toHaveProperty('vehicle');
    });
  });
});

test('Admin can get all zones', async () => {
  const token = await loginAs("admin");

  const query = `
    query GetZones {
      getZones {
        zone
        hourly
        maxDuration {
          hours
          minutes
        }
        openTime
        closeTime
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query })
    .expect(200);

  expect(response.body.errors).toBeUndefined();
  const zones = response.body.data.getZones;
  expect(Array.isArray(zones)).toBe(true);
  
  // eslint-disable-next-line
  zones.forEach((zone: any) => {
    expect(zone).toHaveProperty('zone');
    expect(zone).toHaveProperty('hourly');
    expect(zone).toHaveProperty('maxDuration');
    expect(zone.maxDuration).toHaveProperty('hours');
    expect(zone.maxDuration).toHaveProperty('minutes');
    expect(zone).toHaveProperty('openTime');
    expect(zone).toHaveProperty('closeTime');
  });
});

test('Admin can create a new zone', async () => {
  const token = await loginAs("admin");

  // First get existing zones to find an unused number
  const getZonesQuery = `
    query GetZones {
      getZones {
        zone
      }
    }
  `;

  const existingZonesResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: getZonesQuery });

  const existingZones = existingZonesResponse.body.data.getZones.map((z: { zone: string }) => parseInt(z.zone));
  
  // Find first available number not in use
  let newZoneNumber = 1;
  while (existingZones.includes(newZoneNumber)) {
    newZoneNumber++;
  }

  const mutation = `
    mutation CreateZone($input: NewZone!) {
      createZone(input: $input)
    }
  `;

  const variables = {
    input: {
      zone: newZoneNumber,
      weekday: {
        hourly: 3.50,
        maxDuration: {
          hours: 2,
          minutes: 30
        },
        openTime: "08:00",
        closeTime: "18:00"
      },
      weekend: {
        hourly: 3.50,
        maxDuration: {
          hours: 2,
          minutes: 30
        },
        openTime: "08:00",
        closeTime: "18:00"
      }
    }
  };

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: mutation, variables })
    .expect(200);

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.createZone).toBe(true);

  // Verify the zone was created
  const verifyQuery = `
    query GetZones {
      getZones {
        zone
        hourly
        maxDuration {
          hours
          minutes
        }
        openTime
        closeTime
      }
    }
  `;

  const verifyResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: verifyQuery });

  const newZone = verifyResponse.body.data.getZones // eslint-disable-next-line
    .find((z: any) => z.zone === newZoneNumber.toString());

  expect(newZone).toBeDefined();
  expect(newZone.hourly).toBe(3.50);
  expect(newZone.maxDuration.hours).toBe(2);
  expect(newZone.maxDuration.minutes).toBe(30);
  expect(newZone.openTime).toBe("08:00");
  expect(newZone.closeTime).toBe("18:00");
});

test('Admin can fetch all active permits', async () => {
  const token = await loginAs("admin");

  const query = `
    query GetAllPermits($activeOnly: Boolean) {
      allPermits(activeOnly: $activeOnly) {
        vehicle
        type
        area
        purchaseDate
        activeDate
        expireDate
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query,
      variables: { activeOnly: true },
    });

  expect(response.body.errors).toBeUndefined();
  expect(Array.isArray(response.body.data.allPermits)).toBe(true);
});

test('Admin can get zone stats', async () => {
  const token = await loginAs("admin");

  const query = `
    query GetZoneStats($activeOnly: Boolean) {
      allZoneStats(activeOnly: $activeOnly) {
        area
        totalPermits
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query,
      variables: { activeOnly: true },
    });

  expect(response.body.errors).toBeUndefined();
  const zones = response.body.data.allZoneStats;
  expect(Array.isArray(zones)).toBe(true);
  zones.forEach((zone: { area: string; totalPermits: number }) => {
    expect(typeof zone.area).toBe('string');
    expect(typeof zone.totalPermits).toBe('number');
  });
});


test('Admin can get lot stats', async () => {
  const token = await loginAs("admin");

  const query = `
    query GetLotStats($activeOnly: Boolean) {
      allLotStats(activeOnly: $activeOnly) {
        area
        totalPermits
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query,
      variables: { activeOnly: true },
    });

  expect(response.body.errors).toBeUndefined();
  const lots = response.body.data.allLotStats;
  expect(Array.isArray(lots)).toBe(true);
  lots.forEach((lot: { area: string; totalPermits: number }) => {
    expect(typeof lot.area).toBe('string');
    expect(typeof lot.totalPermits).toBe('number');
  });
});

test('Admin sees correct permit in allPermits query', async () => {
  const token = await loginAs("admin");

  const query = `
    query AllPermits($activeOnly: Boolean) {
      allPermits(activeOnly: $activeOnly) {
        vehicle
        type
        area
        activeDate
        expireDate
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query,
      variables: { activeOnly: true }
    });

  expect(response.body.errors).toBeUndefined();
  const permits = response.body.data.allPermits;
  expect(Array.isArray(permits)).toBe(true);
  expect(permits.length).toBe(1);
  expect(permits[0].area).toBe("123");
});

test('Admin sees no lot permits in allLotStats', async () => {
  const token = await loginAs("admin");

  const query = `
    query AllLotStats($activeOnly: Boolean) {
      allLotStats(activeOnly: $activeOnly) {
        area
        totalPermits
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query,
      variables: { activeOnly: true }
    });

  expect(response.body.errors).toBeUndefined();
  const lots = response.body.data.allLotStats;
  expect(Array.isArray(lots)).toBe(true);
  expect(lots.length).toBe(0);
});

import { pool } from '../src/permit/db'

interface ZoneStat {
  area: string
  totalPermits: number
}

interface LotStat {
  area: string
  totalPermits: number
}

interface ZoneStatsResponse {
  data: {
    allZoneStats: ZoneStat[]
  }
}

interface LotStatsResponse {
  data: {
    allLotStats: LotStat[]
  }
}

test('Admin sees correct zone and lot stats after inserting test data', async () => {
  const token = await loginAs("admin");

  const now = new Date()
  const purchaseDate = now.toISOString()
  const activeDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString() // 1hr ago
  const expireDate = new Date(now.getTime() + 60 * 60 * 1000).toISOString() // 1hr later

  const commonData = {
    purchaseDate,
    activeDate,
    expireDate,
    area: '111',
    receipt: { service: 0.5, subTotal: 2.5, total: 3.0 },
    paymentMethod: 'credit'
  }

  await pool.query(`
    INSERT INTO permit (vehicle, type, data) VALUES
      ('11111111-1111-1111-1111-111111111111', '39f48f9f-2693-446b-ad98-f72298bc7bbe', $1),
      ('22222222-2222-2222-2222-222222222222', '39f48f9f-2693-446b-ad98-f72298bc7bbe', $1),
      ('33333333-3333-3333-3333-333333333333', 'b7a7d5d0-1b8f-4b02-a012-5c667ef2ecb1', jsonb_set($1::jsonb, '{area}', '"A"')),
      ('44444444-4444-4444-4444-444444444444', '93e3c80a-95ca-4f21-803a-2680b4d1994e', jsonb_set($1::jsonb, '{area}', '"B"'))
  `, [commonData])

  // Step 2: Query zone stats
  const zoneStatsQuery = `
    query {
      allZoneStats(activeOnly: true) {
        area
        totalPermits
      }
    }
  `
  const zoneStatsRes = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query: zoneStatsQuery })

  expect(zoneStatsRes.body.errors).toBeUndefined()
  const zoneData: ZoneStatsResponse = zoneStatsRes.body

  const zone111 = zoneData.data.allZoneStats.find((z) => z.area === "111")
  expect(zone111?.totalPermits).toBe(2)

  // Step 3: Query lot stats
  const lotStatsQuery = `
    query {
      allLotStats(activeOnly: true) {
        area
        totalPermits
      }
    }
  `
  const lotStatsRes = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query: lotStatsQuery })

  expect(lotStatsRes.body.errors).toBeUndefined()
  const lotData: LotStatsResponse = lotStatsRes.body

  const lotA = lotData.data.allLotStats.find((l) => l.area === "A")
  const lotB = lotData.data.allLotStats.find((l) => l.area === "B")

  expect(lotA?.totalPermits).toBe(1)
  expect(lotB?.totalPermits).toBe(1)
})


test('Admin sees only active permits when using activeOnly: true', async () => {
  const token = await loginAs("admin");

  // Shared timestamps
  const now = new Date()
  const purchaseDate = now.toISOString()

  const activeActiveDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString() // 1 hour ago
  const activeExpireDate = new Date(now.getTime() + 60 * 60 * 1000).toISOString() // 1 hour later

  const inactiveActiveDate = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  const inactiveExpireDate = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago (expired)

  // Active zone permit (area 27)
  const activeZoneData = {
    purchaseDate,
    activeDate: activeActiveDate,
    expireDate: activeExpireDate,
    area: '27',
    receipt: { service: 0.5, subTotal: 2.5, total: 3.0 },
    paymentMethod: 'credit'
  }

  // Inactive zone permit (area 101)
  const inactiveZoneData = {
    purchaseDate,
    activeDate: inactiveActiveDate,
    expireDate: inactiveExpireDate,
    area: '101',
    receipt: { service: 0.5, subTotal: 2.5, total: 3.0 },
    paymentMethod: 'credit'
  }

  // Inactive lot permit (area C)
  const inactiveLotData = {
    purchaseDate,
    activeDate: inactiveActiveDate,
    expireDate: inactiveExpireDate,
    area: 'C',
    receipt: { service: 0.5, subTotal: 2.5, total: 3.0 },
    paymentMethod: 'credit'
  }

  await pool.query(`
    INSERT INTO permit (vehicle, type, data) VALUES
      ('55555555-5555-5555-5555-555555555555', 'f26adf21-f967-4283-8417-8e0db1ef14bd', $1),
      ('66666666-6666-6666-6666-666666666666', '1d603a73-4b75-48d8-b677-48b81b7fa3f4', $2),
      ('77777777-7777-7777-7777-777777777777', '1a6fc438-e678-426a-a5fd-44cd6740ffb2', $3)
  `, [activeZoneData, inactiveZoneData, inactiveLotData]);

  // Step 1: Query zone stats
  const zoneStatsQuery = `
    query {
      allZoneStats(activeOnly: true) {
        area
        totalPermits
      }
    }
  `
  const zoneStatsRes = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query: zoneStatsQuery })

  expect(zoneStatsRes.body.errors).toBeUndefined()
  const zoneStats: ZoneStat[] = zoneStatsRes.body.data.allZoneStats

  const zone27 = zoneStats.find(z => z.area === '27')
  const zone101 = zoneStats.find(z => z.area === '101')

  expect(zone27?.totalPermits).toBe(1)
  expect(zone101).toBeUndefined() // Expired, shouldn't appear

  // Step 2: Query lot stats
  const lotStatsQuery = `
    query {
      allLotStats(activeOnly: true) {
        area
        totalPermits
      }
    }
  `
  const lotStatsRes = await supertest(server)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query: lotStatsQuery })

  expect(lotStatsRes.body.errors).toBeUndefined()
  const lotStats: LotStat[] = lotStatsRes.body.data.allLotStats

  const lotC = lotStats.find(l => l.area === 'C')

  expect(lotC).toBeUndefined() // Expired lot permit shouldn't show up
});

