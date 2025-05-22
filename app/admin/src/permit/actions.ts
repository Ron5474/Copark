'use server'
import { cookies } from 'next/headers';
import { PermitsByDay } from '../types';

const API_URL = 'http://localhost:4003/graphql';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export async function getAllPermitsByDay(): Promise<PermitsByDay[]> {
  const token = await getAuthToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetPermitStats {
          getPermitStats {
            date
            permits {
              vehicle
              type
              area
              activeDate
              expireDate
            }
          }
        }
      `
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.getPermitStats;
}
