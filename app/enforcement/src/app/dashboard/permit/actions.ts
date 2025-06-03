'use server'
import { cookies } from 'next/headers'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('sessionEnf')?.value
  return token
}

export async function checkPermit(plate: string, state: string) {
  console.log("CHECKING PERMIT FOR PLATE: ", plate, " STATE: ", state)
  const query = `
    query CheckedPermit($plate: String!, $state: String!) {
      checkPermit(plate: $plate, state: $state) {
        type
        area
      }
    }
  `
  const token = await getAuthToken()
  if (!token) throw new Error('Unauthorized: Missing session token')
  const response = await fetch('http://localhost:4003/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        plate,
        state
      },
    }),
  })

  const result = await response.json()

  // if (result.errors) {
  //   throw new Error(`GraphQL error: ${result.errors[0].message}`)
  // }

  console.log("CHECKED PERMITS: ", result)
  return result.data.checkPermit
}
