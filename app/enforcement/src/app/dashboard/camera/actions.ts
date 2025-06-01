// 'use server'

// import { cookies } from 'next/headers'

// export const scanPlate = async (imageDataURL: string): Promise<string> => {
//   try {
//     const cookieStore = await cookies()
//     const sessionToken = cookieStore.get('next-auth.session-token')?.value


//     const blob = await (await fetch(imageDataURL)).blob()
//     const formData = new FormData()
//     formData.append('image', blob, 'capture.png')
//     console.log('Sending Picture')
//     const response = await fetch('http://vehicle:4004/api/v0/vehicle/scan', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${sessionToken}`,
//       },
//       body: formData,
//     })

//     if (!response.ok) {
//       const error = await response.json()
//       throw new Error(error.error || 'OCR service error')
//     }

//     console.log('I am done with request')

//     const data = await response.json()
//     const plate = data.plate?.trim?.()

//     if (!plate) throw new Error('No plate detected')

//     return plate
//   } catch (err) {
//     console.error('scanPlate() failed:', err)
//     throw err
//   }
// }

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