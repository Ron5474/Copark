'use server'
import { cookies } from 'next/headers'
import { Vehicle } from '../types'

const API_URL = 'http://localhost:4001/graphql'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
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
            getMyVehicles {
              plate,
              country,
              state,
              nickname
            }
          }
        `,
      }),
    })

    const result = await response.json()

    return result.data.getMyVehicles
  } catch (error) {
    throw error
  }
}

export const addVehicle = async (vehicle: Vehicle): Promise<Vehicle[]> => {
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
          mutation RegisterVehicle($vehicle: Vehicle!) {
            registerVehicle(vehicle: $vehicle) {
              id
              name
              email
              accountStatus
            }
          }
        `,
        variables: {
          vehicle,
        },
      }),
    })

    const result = await response.json()
    return result.data.registerVehicle
  } catch (error) {
    console.error('Error adding enforcer:', error)
    throw error
  }
}
