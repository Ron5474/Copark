import {http, HttpResponse} from 'msw'

const authURL = 'http://localhost:3010/api/v0/auth'
const vehicleURL = 'http://localhost:4001/graphql'

export interface Vehicle {
  plate: string
  country: string
  state: string
  nickname?: string
}

const vehicles: Vehicle[] = []


interface Server {
  use: (...handlers: import('msw').RequestHandler[]) => void
}

const auth = (server: Server): void => {
  server.use(
    http.get(authURL + '/driver/id', async (): Promise<HttpResponse<string>> => {
      return HttpResponse.json("auth-token")
    }),
  )
}

const vehicle = (server: Server): void => {
  server.use(
    http.post(vehicleURL, async ({ request }) => {
      const body = await request.json()

      if (body && typeof body === 'object' && 'query' in body && typeof body.query === 'string' && body.query.includes('query GetVehicles')) {
        return HttpResponse.json({
          data: {
            myVehicles: vehicles,
          },
        })
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

export {auth, vehicle, vehicles}
