import { cookies } from 'next/headers'

export interface APICredential {
  name: string
  email: string
  role: string
}

export interface APIUser {
  id: string
  name: string
  email: string
  role: string
}

const API_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:4000/graphql'

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export const addAPIUser = async (organization: APICredential): Promise<APIUser | undefined> => {
  const token = await getAuthToken()
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation AddAPIUser($organization: APICredential!) {
          addAPIUser(organization: $organization) {
            id
            name
            email
            role
          }
        }
      `,
      variables: {
        organization
      },
    }),
  })

  const result = await response.json()
  return result.data?.addAPIUser
}