// 'use server'
// import { cookies } from 'next/headers'

// const getAuthToken = async () => {
//   const cookieStore = await cookies()
//   const token = cookieStore.get('session')?.value
//   return token
// }

// export async function checkPermit(plate: string) {
//   const query = `
//     mutation IsValidPermit($input: IsValidInput!) {
//       isValidPermit(input: $input) {
//         isValid
//         type
//         zone
//       }
//     }
//   `;

//   const token = await getAuthToken()
//   console.log(token)
//   if (!token) throw new Error('Unauthorized: Missing session token')


//   const response = await fetch('http://localhost:4002/graphql', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       query,
//       variables: {
//         input: {
//           vehicle: plate,
//         },
//       },
//     }),
//   });

//   const result = await response.json()
//   return result.data.isValidPermit
// }

'use server'
import { cookies } from 'next/headers'

const getAuthToken = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  return token
}

export async function checkPermit(plate: string) {
  const query = `
    mutation IsValidPermit($input: IsValidInput!) {
      isValidPermit(input: $input) {
        isValid
        type
        zone
      }
    }
  `;

  const token = await getAuthToken()
  console.log(token)
  if (!token) throw new Error('Unauthorized: Missing session token')


  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          vehicle: plate,
        },
      },
    }),
  });

  const result = await response.json()
  console.log('GraphQL response:', result) // Debug the response
  
  // Handle potential errors
  if (result.errors) {
    console.error('GraphQL errors:', result.errors)
    throw new Error(`GraphQL error: ${result.errors[0].message}`)
  }
  
  return result.data.isValidPermit
}