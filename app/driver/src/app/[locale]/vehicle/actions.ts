'use server'

import { cookies } from 'next/headers'
import { Vehicle } from '../types'

const API_URL = 'http://localhost:4001/graphql'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)?.value
  return token
}

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const token = await getAuthToken()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query GetVehicles {
            myVehicles {
              plate
              country
              state
              nickname
            }
          }
        `,
      }),
    })

    const result = await response.json()
    console.log('GraphQL response:', result)

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error('Failed to fetch vehicles')
    }

    return result.data.myVehicles
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    throw error
  }
}

export const addVehicle = async (vehicle: Vehicle): Promise<Vehicle> => {
  try {
    const token = await getAuthToken()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation RegisterVehicle($input: RegisterVehicleInput!) {
            registerVehicle(input: $input) {
              id
              plate
              country
              state
              nickname
            }
          }
        `,
        variables: {
          input: vehicle,
        },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error('Failed to register vehicle')
    }

    return result.data.registerVehicle
  } catch (error) {
    console.error('Error adding vehicle:', error)
    throw error
  }
}
