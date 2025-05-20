import { Ticket } from '../types'

export async function getTicketsByDay(token: string): Promise<Record<string, Ticket[]>> {
  const query = `
    query {
      getTicketsStats {
        id
        vehicle
        enforcer
        issuedDate
        violation
        fine
        ticketStatus
        images
        note
      }
    }
  `

  const response = await fetch('http://localhost:4003/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  return result.data.getTicketsStats
}
