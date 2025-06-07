'use server'

import { cookies } from 'next/headers'
import { Vehicle, EditVehicle, ErrorResponse } from '../types'

const API_URL = 'http://localhost:4001/graphql'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)?.value
  return token
}

export const getVehicles = async (): Promise<Vehicle[]> => {
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
}

export const addVehicle = async (vehicle: Vehicle): Promise<Vehicle> => {
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
}

export const editVehicle = async (vehicleEdit: EditVehicle): Promise<Vehicle> => {
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
}

export const deleteVehicle = async (plate: string, state?: string): Promise<boolean|ErrorResponse> => {
    if (!plate || !state) {
      throw new Error('Plate and state are required to delete a vehicle')
    }
    const token = await getAuthToken()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation DeleteVehicle($plate: String!, $state: String!) {
            deleteVehicle(plate: $plate, state: $state) {
              id
            }
          }
        `,
        variables: {
          plate,
          state
        },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      return {
        message: result.errors[0]?.message,
        type: 'error'
      }
    }

    return result.data.deleteVehicle
}

export async function updateDefaultVehicle(vehicleId: string): Promise<Vehicle> {
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
      throw new Error(result.errors[0]?.message)
    }

    return result.data.updateDefaultVehicle
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
                        plate,
                        state,
                        nickname
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
