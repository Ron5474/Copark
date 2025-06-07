import {http, HttpResponse} from 'msw'

const authURL = 'http://localhost:3010/api/v0/auth'
const permitURL = 'http://localhost:4003/graphql'

interface Server {
  use: (...handlers: import('msw').RequestHandler[]) => void
}

const auth = (server: Server, failPost=false): void => {
  server.use(
    http.post(authURL + '/check', async ({ request }): Promise<HttpResponse<object>> => {
      const authHeader = request.headers.get('Authorization')
      const token = authHeader?.split(' ')[1]
      if (!token) return new HttpResponse(null, {status: 401})
      if (!failPost) {
        return HttpResponse.json({
          'id': '123',
          'role': 'police'
        })
      } else {
        return new HttpResponse(null, {status: 401})
      }
    }),
  )
}

const vehicle = (server: Server, failGet=false): void => {
  server.use(
    http.post(permitURL, async ({ request }) => {
      const body = await request.json()

      if (body && typeof body === 'object' && typeof body.query === 'string') {
        if (body.query.includes('query IsValidPermitByPolice')) {
          if (!failGet) {
            return HttpResponse.json({
              data: {
                isValidPermitByPolice: {isValid: true}
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

export {auth, vehicle}
