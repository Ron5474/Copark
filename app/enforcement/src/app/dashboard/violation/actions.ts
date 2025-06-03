'use server'

import { cookies } from 'next/headers'
// import { toBase64 } from './toBase64'

type TicketInput = {
  plate: string
  state: string
  reason: string
  note?: string
  images?: File | null
}

export async function issueTicket({ plate, state, reason, note, images }: TicketInput) {
  const cookieStore = cookies()
  const token = (await cookieStore).get('sessionEnf')?.value

  if (!token) {
    throw new Error('Unauthorized: No session token found.')
  }

  const mutation = `
    mutation CreateNewTicket($input: NewTicketInput!) {
      createNewTicket(input: $input) {
        id
        issuedDate
        violation
        fine
        ticketStatus
        images
      }
    }
  `

  let base64Image: string | null = null
  if (images) {
    const arrayBuffer = await images.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    base64Image = `data:${images.type};base64,${base64}`
  }


  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          plate,
          state,
          reason,
          note,
          images: base64Image,
        },
      },
    }),
  })

  const result = await response.json()

  if (result.errors) {
    console.error('GraphQL error:', result.errors)
    throw new Error(result.errors[0].message)
  }

  return result.data.createNewTicket
}
