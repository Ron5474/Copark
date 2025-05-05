'use server'
import { cookies } from 'next/headers';
import { User, NewUser } from '../types';

const API_URL = 'http://localhost:4000/graphql';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export const getEnforcers = async (): Promise<User[]> => {
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

    const result = await response.json();

    console.log(result)

    return result.data.getEnforcers;
  } catch (error) {
    throw error;
  }
};

export const addEnforcer = async (enforcer: NewUser): Promise<User[]> => {
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
          mutation AddEnforcer($enforcer: NewUser!) {
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

    const result = await response.json();
    return result.data.addEnforcer;
  } catch (error) {
    console.error('Error adding enforcer:', error);
    throw error;
  }
};

export const suspendUser = async (id: string): Promise<User[]> => {
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
          mutation SuspendUser($user: UserInput!) {
            suspendUser(user: $user) {
              id
              name
              email
              accountStatus
            }
          }
        `,
        variables: {
          user: {
            id
          },
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    if (!result.data) {
      throw new Error('No data returned from the server');
    }

    return result.data.suspendUser;
  } catch (error) {
    console.error('Error suspending enforcer:', error);
    throw error;
  }
};
