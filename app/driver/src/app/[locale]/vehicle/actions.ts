'use server'

import { cookies } from 'next/headers'
import { Vehicle, EditVehicle } from '../types'

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
              id
              plate
              country
              state
              nickname
              default
            }
          }
        `,
      }),
    })

    const result = await response.json()
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
      const message = result.errors[0]?.message
      if (message.includes("already registered")) {
        throw new Error("This plate has already been registered.")
      }
      throw new Error('Failed to register vehicle')
    }

    return result.data.registerVehicle
  } catch (error) {
    console.error('Error adding vehicle:', error)
    throw error
  }
}

export const editVehicle = async (vehicleEdit: EditVehicle): Promise<Vehicle> => {
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
          mutation UpdateVehicle($input: UpdateVehicleInput!) {
            updateVehicle(input: $input) {
              id
              plate
              country
              state
              nickname
            }
          }
        `,
        variables: {
          input: vehicleEdit,
        },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      throw new Error('Failed to edit vehicle')
    }

    return result.data.registerVehicle
  } catch (error) {
    console.error('Error editing vehicle:', error)
    throw error
  }
}

export async function updateDefaultVehicle(vehicleId: string): Promise<Vehicle> {
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
          mutation UpdateDefaultVehicle($input: setDefaultVehicleInput!) {
            setDefaultVehicle(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {id: vehicleId }
        }
      }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error(result.errors[0]?.message || 'Failed to update default vehicle')
    }

    return result.data.updateDefaultVehicle
  } catch (error) {
    console.error('Error updating default vehicle:', error)
    throw error
  }
}

export async function getDefaultVehicle(): Promise<Vehicle | null> {
  const vehicleRes = await fetch("http://localhost:4001/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        query: `query defaultVehicle {
                      getDefaultVehicle {
                        id,
                        plate
                      }
                  }`
      })
    })

    const vehicle = await vehicleRes.json();

    if (vehicle.errors) {
      console.error('GraphQL errors:', vehicle.errors)
      return null
    }

    if (vehicle.data.getDefaultVehicle) {
      return vehicle.data.getDefaultVehicle
    } else {
      return null
    }
}