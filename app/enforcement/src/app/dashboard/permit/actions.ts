'use server'
import { cookies } from 'next/headers'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('sessionEnf')?.value
  return token
}

export async function checkPermit(plate: string) {
  const query = `
    query IsValidZonePermit($input: IsValidPermitInput!) {
      isValidZonePermit(input: $input) {
        isValid
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
        input: {
          vehicle: plate,
        },
      },
    }),
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(`GraphQL error: ${result.errors[0].message}`)
  }

  return result.data.isValidZonePermit
}
