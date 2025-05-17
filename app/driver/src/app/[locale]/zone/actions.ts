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

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
