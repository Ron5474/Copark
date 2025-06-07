'use server';

import { cookies } from "next/headers";
import { LotGroup, MyPermits } from "../types";

export const getLotDetails = async (): Promise<LotGroup[]> => {
  const token = (await cookies()).get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!)?.value

  const response = await fetch('http://localhost:4003/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetLotDetails {
          allLotDetails {
            id
            title
            lots {
              name
              price
            }
          }
        }
      `,
    }),
  })

  const result = await response.json()

  if (result.errors) {
    console.error(result.errors)
    throw new Error('Failed to fetch lot details')
  }

  return result.data.allLotDetails
}

export const getMyPermits = async (): Promise<MyPermits> => {
  const token = (await cookies()).get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!)?.value

  const response = await fetch('http://localhost:4003/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetMyPermits {
          myPermits {
            active {
              vehicle
              type
              area
              durationType
              activeDate
              expireDate
            }
            future {
              vehicle
              type
              area
              durationType
              activeDate
              expireDate
            }
            expired {
              vehicle
              type
              area
              durationType
              activeDate
              expireDate
            }
          }
        }
      `,
    }),
  })

  const result = await response.json()

  if (result.errors) {
    console.error(result.errors)
    throw new Error('Failed to fetch my permits')
  }

  return result.data.myPermits
}