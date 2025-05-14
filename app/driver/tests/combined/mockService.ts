import {http, HttpResponse} from 'msw'

const authURL = 'http://localhost:3010/api/v0/auth'
const vehicleURL = 'http://localhost:4001/graphql'
const permitURL = 'http://localhost:4003/graphql'

export interface Vehicle {
  plate: string
  country: string
  state: string
  nickname?: string
}

interface Duration{
  hours: number
  minutes: number
}

export interface ZoneDetails {
  daily?: number
  hourly?: number
  maxDuration?: Duration
  openTime?: string
  closeTime?: string
}


interface Server {
  use: (...handlers: import('msw').RequestHandler[]) => void
}

const auth = (server: Server, failLogin=false): void => {
  server.use(
    http.get(authURL + '/driver/id', async (): Promise<HttpResponse<string>> => {
      return HttpResponse.json("auth-token")
    }),

    http.post(authURL + '/driver/login', async (): Promise<HttpResponse<string>> => {
      if (failLogin) {
        return new HttpResponse(null, {status: 401})
      } else {
        return HttpResponse.json("auth-token")
      }
    }),

    http.get('/driver/api/auth/session', async (): Promise<HttpResponse<object>> => {
      if (failLogin) {
        return HttpResponse.json({ expires: null, user: null })
      } else {
        return HttpResponse.json({
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user: {
            name: 'Test User',
            email: 'test@example.com',
          }
        })
      }
    }),

    http.get('/driver/api/auth/csrf', async (): Promise<HttpResponse<object>> => {
      return HttpResponse.json({
        csrfToken: 'mock-csrf-token-123',
      })
    }),

    http.get('/driver/api/auth/signout', async (): Promise<HttpResponse<string>> => {
      if (failLogin) {
        return HttpResponse.json("Login Again")
      } else {
        return HttpResponse.json("Redirecting You to home")
      }
    }),

    http.post('http://localhost:3000/driver/api/auth/signout', async () => {
      return HttpResponse.json("Signed out successfully");
    }),

    http.all('http://localhost:3000/*', async () => {
      return HttpResponse.json({ message: "Mocked response" });
    }),

    http.all('*', async () => {
      // console.log(`Caught unhandled request to: ${request.url}`);
      return HttpResponse.json({ message: "Mocked response" }, { status: 200 });
    }),

  )
}


const vehicles: Vehicle[] = []

const vehicle = (server: Server, failGet=false, failAdd=false): void => {
  server.use(
    http.post(vehicleURL, async ({ request }) => {
      const body = await request.json()

      if (body && typeof body === 'object' && typeof body.query === 'string') {
        if (body.query.includes('query GetVehicles')) {
          if (!failGet) {
            return HttpResponse.json({
              data: {
                myVehicles: vehicles,
              },
            })
          } else {
            return HttpResponse.json({
              errors: [{ message: 'Failed to connect' }],
            }, { status: 200 })
          }
        }

        if (body.query.includes('mutation RegisterVehicle')) {
          const inputVehicle = body.variables?.input

          if (inputVehicle) {
            if (!failAdd) {
              
              const newVehicle = {
                id: String(vehicles.length + 1),
                ...inputVehicle,
              }

              vehicles.push(newVehicle)

              return HttpResponse.json({
                data: {
                  registerVehicle: newVehicle,
                },
              })
            } else {
              return HttpResponse.json({
                errors: [{ message: 'Failed to connect' }],
              }, { status: 200 })
            }
          }

          return HttpResponse.json(
            {
              errors: [{ message: 'Missing input variable' }],
            },
            { status: 400 }
          )
        }
      }

      return HttpResponse.json(
        {
          errors: [{ message: 'Unknown query' }],
        },
        { status: 400 }
      )
    })
  )
}


const zoneDetails: ZoneDetails = {
  hourly: 2.50,
  maxDuration: {hours: 2, minutes: 0},
  openTime: '07:00',
  closeTime: '20:00'
}

const permit = (server: Server, failGet=false): void => {
  server.use(
    http.post(permitURL, async ({ request }) => {
      const body = await request.json()

      if (body && typeof body === 'object' && typeof body.query === 'string') {
        if (body.query.includes('query GetZoneDetails')) {
          if (!failGet) {
            return HttpResponse.json({
              data: {
                zoneDetails,
              },
            })
          } else {
            return HttpResponse.json({
              errors: [{ message: 'Failed to connect' }],
            }, { status: 200 })
          }
        }
      }

      return HttpResponse.json(
        {
          errors: [{ message: 'Unknown query' }],
        },
        { status: 400 }
      )
    })
  )
}

export {
  auth,
  vehicle,
  permit,
  vehicles
}
