'use server';
import { cookies } from 'next/headers';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export async function getTicketsByDay() {
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

  console.log(JSON.stringify(result.data.getTicketsStats, null, 2));

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  return result.data.getTicketsStats
}
