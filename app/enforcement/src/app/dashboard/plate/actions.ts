'use server'

import { cookies } from 'next/headers'
import { Vehicle } from '../../types'

const API_URL = 'http://localhost:4001/graphql'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  return token
}

export const findVehicleByPlate = async (plate: string): Promise<Vehicle | null> => {
  try {
    const token = await getAuthToken()
    console.log(token)
    if (!token) throw new Error('Unauthorized: Missing session token')

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query FindVehicleByPlate($plate: String!) {
            findVehicleByPlate(plate: $plate) {
              id
              plate
            }
          }
        `,
        variables: { plate },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error('Failed to find vehicle by plate')
    }

    return result.data.findVehicleByPlate
  } catch (error) {
    console.error('Error fetching vehicle by plate:', error)
    throw error
  }
}
