'use server'

import { cookies } from 'next/headers'
import { Ticket } from '../types'

const API_URL = 'http://localhost:4002/graphql'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)?.value
  return token
}

export const getTickets = async (): Promise<Ticket[]> => {
    const token = await getAuthToken()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query getMyTickets {
            getMyTickets {
                id
                vehicle
                fine
                violation
                images
                ticketStatus
                issuedDate
            }
          }
        `,
      }),
    })

    const result = await response.json()
    console.log('GraphQL GET TICKETS response:', result)
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error('Failed to fetch tickets')
    }

    return result.data.getMyTickets
}

export const challengeTicket = async (ticketID: string, reason: string): Promise<Ticket[]> => {
    const token = await getAuthToken()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation ChallengeTicket($ticketID: TicketInput!, $reason: String!) {
            challengeTicket(ticketID: $ticketID, challengeReason: $reason) {
              id
              ticketStatus
              challengeReason
            }
          }
        `,
        variables: {
          ticketID: { id: ticketID },
          reason: reason,
        },
      }),
    })

    const result = await response.json()
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error('Failed to challenge ticket')
    }

    return result.data.challengeTicket
}
