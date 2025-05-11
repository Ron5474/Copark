import { http, HttpResponse } from 'msw'

const authURL = 'http://localhost:3010/api/v0/auth'

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


export { authHandlers }
