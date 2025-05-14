'use server'

import { cookies } from 'next/headers'
import { ZoneDetails } from '../types'

const API_URL = 'http://localhost:4003/graphql'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)?.value
  return token
}

export const getZoneDetails = async (zone: string): Promise<ZoneDetails> => {
  try {
    const token = await getAuthToken()

    const res = await fetch("http://localhost:3010/api/v0/auth/driver/id", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const driverToken = await res.json()
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`,
      },
      body: JSON.stringify({
        query: `
          query GetZoneDetails($zone: String!) {
            zoneDetails(zone: $zone) {
              daily
              hourly
              maxDuration {
                hours
                minutes
              }
              openTime
              closeTime
            }
          }
        `,
        variables: {
          zone,
        },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error(result.errors[0].message)
    }

    return result.data.zoneDetails
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    throw error
  }
}

// export const addVehicle = async (vehicle: Vehicle): Promise<Vehicle> => {
//   try {
//     const token = await getAuthToken()
//     const res = await fetch("http://localhost:3010/api/v0/auth/driver/id", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//     const driverToken = await res.json()

//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${driverToken}`,
//       },
//       body: JSON.stringify({
//         query: `
//           mutation RegisterVehicle($input: RegisterVehicleInput!) {
//             registerVehicle(input: $input) {
//               id
//               plate
//               country
//               state
//               nickname
//             }
//           }
//         `,
//         variables: {
//           input: vehicle,
//         },
//       }),
//     })

//     const result = await response.json()

//     if (result.errors) {
//       console.error('GraphQL errors:', result.errors)
//       throw new Error('Failed to register vehicle')
//     }

//     return result.data.registerVehicle
//   } catch (error) {
//     console.error('Error adding vehicle:', error)
//     throw error
//   }
// }
