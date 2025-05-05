'use server'
import { cookies } from 'next/headers';
import { EnforcementUser, NewEnforcementUser } from './types';

const API_URL = 'http://localhost:4000/graphql';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export const getEnforcers = async (): Promise<EnforcementUser[]> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query GetEnforcers {
            getEnforcers {
              id
              name
              email
              accountStatus
            }
          }
        `,
      }),
    });

    const { data } = await response.json();
    return data.getEnforcers;
  } catch (error) {
    throw error;
  }
};

export const addEnforcer = async (enforcer: NewEnforcementUser): Promise<EnforcementUser[]> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation AddEnforcer($enforcer: NewEnforcementUser!) {
            addEnforcer(enforcer: $enforcer) {
              id
              name
              email
              accountStatus
            }
          }
        `,
        variables: {
          enforcer,
        },
      }),
    });

    const { data } = await response.json();
    return data.addEnforcer;
  } catch (error) {
    console.error('Error adding enforcer:', error);
    throw error;
  }
};
