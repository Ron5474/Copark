'use server'
import { cookies } from 'next/headers'

export const scanPlate = async (imageDataURL: string): Promise<{plate: string, state: string}> => {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('sessionEnf')?.value

    console.log('Sending Picture via GraphQL')

    const graphqlQuery = {
      query: `
        mutation RecognizePlate($input: RecognizePlateInput!) {
          recognizePlate(input: $input) {
            plate
            state
          }
        }
      `,
      variables: {
        input: {
          image: imageDataURL
        }
      }
    }

    const response = await fetch('http://localhost:4004/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(graphqlQuery),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'GraphQL service error')
    }

    console.log('I am done with request')
    const data = await response.json()

    // Handle GraphQL errors
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message || 'GraphQL mutation error')
    }

    const vehicleData = data.data?.recognizePlate
    if (!vehicleData.plate) throw new Error('No plate detected')

    return vehicleData
  } catch (err) {
    console.error('scanPlate() failed:', err)
    throw err
  }
}