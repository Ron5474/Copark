'use server'
import { cookies } from 'next/headers';
import { User } from '../types';

const API_URL = 'http://localhost:4000/graphql';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export const getDrivers = async (): Promise<User[]> => {
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
          query GetDrivers {
            getDrivers {
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

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.getDrivers;
  } catch (error) {
    console.error('Error fetching drivers:', error);
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
      throw new Error(result.errors[0].message);
    }

    return result.data.suspendUser;
  } catch (error) {
    console.error('Error suspending driver:', error);
    throw error;
  }
};

export const reinstateUser = async (id: string): Promise<User[]> => {
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
          mutation ReinstateUser($user: UserInput!) {
            reinstateUser(user: $user) {
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
      throw new Error(result.errors[0].message);
    }

    return result.data.reinstateUser;
  } catch (error) {
    console.error('Error reinstating driver:', error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<User[]> => {
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
          mutation DeleteUser($user: UserInput!) {
            deleteUser(user: $user) {
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
      throw new Error(result.errors[0].message);
    }

    return result.data.deleteUser;
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};
