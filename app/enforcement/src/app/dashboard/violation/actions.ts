'use server'

import { cookies } from 'next/headers'

type TicketInput = {
  plate: string
  reason: string
  note?: string
  images?: string | null
}

export async function issueTicket({ plate, reason, note, images }: TicketInput) {
  const cookieStore = cookies()
  const token = (await cookieStore).get('session')?.value

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
          reason,
          note,
          images,
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
