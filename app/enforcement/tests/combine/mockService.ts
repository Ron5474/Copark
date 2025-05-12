import { http, HttpResponse } from 'msw'

const authURL = 'http://localhost:3010/api/v0/auth'
const permitURL = 'http://localhost:4003/graphql'

const authHandlers = {
  success: http.post(authURL + '/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    const { email, password } = body

    if (email === 'officer1@outlook.com' && password === 'password1') {
      return HttpResponse.json({ id: 'abc123', name: 'Officer Joe' })
    }

    return HttpResponse.json({}, { status: 401 })
  }),

  failure: http.post(authURL + '/login', async () => {
    return HttpResponse.json({}, { status: 401 })
  }),
}


const permitHandlers = {
  success: http.post(permitURL, async ({ request }) => {
    const body = await request.json()
    if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string'
    ) {
      if (body.query.includes('IsValidZonePermit')) {
        return HttpResponse.json({
          data: {
            isValidZonePermit: {
              isValid: true,
              type: 'Residential',
              zone: 'A1',
            },
          },
        })
      }
    }

    return HttpResponse.json({ errors: [{ message: 'Unknown query' }] }, { status: 400 })
  }),

  failure: http.post(permitURL, async ({ request }) => {
    const body = await request.json()
    if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string'
    ) {
      if (body.query.includes('IsValidZonePermit')) {
        return HttpResponse.json({
          errors: [{ message: 'Zone not permitted' }],
        }, { status: 200 })
      }
    }

    return HttpResponse.json({ errors: [{ message: 'Unknown query' }] }, { status: 400 })
  }),
}



export { authHandlers, permitHandlers }
