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
  return result.data.getEnforcers;
};

export const addEnforcer = async (enforcer: NewUser): Promise<User[]> => {
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
              password
            }
          }
        `,
      variables: {
        enforcer,
      },
    }),
  });

  const result = await response.json();
  const newEnforcer = result.data.addEnforcer[0];

  // Send welcome email with credentials
  await fetch('http://localhost:3015/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: newEnforcer.email,
      subject: 'Welcome to CoPark Enforcement Team',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2>Welcome to the CoPark Enforcement Team!</h2>
          
          <p>Dear ${newEnforcer.name},</p>
          
          <p>Welcome aboard! We're excited to have you join the CoPark Enforcement team. You've been granted access to our enforcement platform where you'll be able to manage parking operations efficiently.</p>
          
          <h3>Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${newEnforcer.email}</p>
          <p><strong>Password:</strong> ${newEnforcer.password}</p>
          
          <p>You can access the enforcement platform at: <a href="https://copark.space/enforcement/login">CoPark Enforcement Portal</a></p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact the admin team.</p>
          
          <p>Best regards,<br>CoPark Administration</p>
        </div>
      `
    })
  });

  return result.data.addEnforcer;
};

export const suspendUser = async (id: string): Promise<User[]> => {
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
  return result.data.suspendUser;
};

export const reinstateUser = async (id: string): Promise<User[]> => {
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
  return result.data.reinstateUser;
};

export const deleteUser = async (id: string): Promise<User[]> => {
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
  return result.data.deleteUser;
};
