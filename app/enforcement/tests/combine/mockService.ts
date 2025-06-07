import { http, HttpResponse } from 'msw'

const authURL = 'http://localhost:3010/api/v0/auth'
const permitURL = 'http://localhost:4003/graphql'
const ticketURL = 'http://localhost:4002/graphql'
const pictureURL = 'http://localhost:4004/graphql'

const authHandlers = {
  success: http.post(authURL + '/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    const { email, password } = body

    if (email === 'officer1@outlook.com' && password === 'password1') {
      return HttpResponse.json({ id: 'abc123', name: 'Officer Joe', role: '["enforcement"]' })
    }

    return HttpResponse.json({}, { status: 401 })
  }),

  failure: http.post(authURL + '/login', async () => {
    return HttpResponse.json({}, { status: 401 })
  }),

  wrongRole: http.post(authURL + '/login', async ({ request }) => {
    await request.json()
    return HttpResponse.json({
      id: 'abc123',
      name: 'Super Admin Boss',
      role: '["admin"]', // not ["enforcement"]
    })
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
      if (body.query.includes('checkPermit')) {
        return HttpResponse.json({
          data: {
            checkPermit: [{
              type: 'Residential',
              area: 'A1',
            }],
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
      typeof body.query === 'string' &&
      body.query.includes('checkPermit')
    ) {
      return HttpResponse.json({
        data: {
          checkPermit: [],
        },
      }, { status: 200 })
    }

    return HttpResponse.json({ errors: [{ message: 'Unknown query' }] }, { status: 400 })
  }),

  // graphqlError: http.post(permitURL, async ({ request }) => {
  //   const body = await request.json()
  //   if (
  //     typeof body === 'object' &&
  //     body !== null &&
  //     'query' in body &&
  //     typeof body.query === 'string' &&
  //     body.query.includes('IsValidZonePermit')
  //   ) {
  //     return HttpResponse.json({
  //       errors: [
  //         { message: 'Zone not permitted' }
  //       ]
  //     }, { status: 200 })
  //   }

  //   return HttpResponse.json({ errors: [{ message: 'Unknown query' }] }, { status: 400 })
  // }),

}

const ticketHandlers = {
  success: http.post(ticketURL, async ({ request }) => {
    const body = await request.json()

    if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string' &&
      body.query.includes('CreateNewTicket')
    ) {
      const { plate, reason, note, images } = body.variables.input

      return HttpResponse.json({
        data: {
          createNewTicket: {
            id: 'abc123',
            issuedDate: '2024-05-18',
            plate,
            violation: reason,
            fine: 75,
            note,
            ticketStatus: 'PENDING',
            images: images ?? null,
          },
        },
      })
    }

    return HttpResponse.json({ errors: [{ message: 'Unknown mutation' }] }, { status: 400 })
  }),

  failure: http.post(ticketURL, async ({ request }) => {
    const body = await request.json()

    if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string' &&
      body.query.includes('CreateNewTicket')
    ) {
      return HttpResponse.json({
        errors: [{ message: 'Invalid plate format' }],
      }, { status: 200 })
    }

    return HttpResponse.json({ errors: [{ message: 'Unknown mutation' }] }, { status: 400 })
  }),

  graphqlError: http.post(ticketURL, async ({ request }) => {
  const body = await request.json()
  if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string' &&
      body.query.includes('CreateNewTicket')
    ) {
    return HttpResponse.json({
      errors: [{ message: 'Ticket service internal error' }],
    }, { status: 200 })
  }

  return HttpResponse.json({ errors: [{ message: 'Unknown mutation' }] }, { status: 400 })
}),

}

const pictureHandlers = {
  success: http.post(pictureURL, async ({ request }) => {
    const body = await request.json()

    if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string' &&
      body.query.includes('recognizePlate')
    ) {
      return HttpResponse.json({
        data: {
          recognizePlate: {
            plate: '7COPARK',
            state: 'CA',
          },
        },
      })
    }

    return HttpResponse.json({ errors: [{ message: 'Unknown mutation' }] }, { status: 400 })
  }),

  graphqlError: http.post(pictureURL, async ({ request }) => {
    const body = await request.json()

    if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string' &&
      body.query.includes('recognizePlate')
    ) {
      return HttpResponse.json({
        errors: [{ message: 'Image is too blurry' }],
      }, { status: 200 })
    }

    return HttpResponse.json({ errors: [{ message: 'Unknown mutation' }] }, { status: 400 })
  }),

  failure: http.post(pictureURL, async ({ request }) => {
    const body = await request.json()

    if (
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof body.query === 'string' &&
      body.query.includes('recognizePlate')
    ) {
      return HttpResponse.json(
        { error: 'GraphQL service crashed' },
        { status: 500 }
      )
    }

    return HttpResponse.json({ error: 'Unknown error' }, { status: 500 })
  }),
}



export { authHandlers, permitHandlers, ticketHandlers, pictureHandlers }
