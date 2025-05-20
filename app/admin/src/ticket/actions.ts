'use server';
import { cookies } from 'next/headers';
import { Ticket } from '../types'

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export async function getTicketsByDay(): Promise<Record<string, Ticket[]>> {
  const token = await getAuthToken();
  const query = `
    query {
      getTicketsStats{
        date
        tickets {
          id
          issuedDate
        }
      }
    }
  `

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  })

  const result = await response.json()

  console.log(result);

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  return result.data.getTicketsStats
}
