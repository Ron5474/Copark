'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login({ email, password }: { email: string; password: string }) {
  const response = await fetch('http://localhost:8000/api/v0/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response || !response.ok) {
    return undefined;
  }

  // Ensure the response body is valid before parsing
  const text = await response.text();
  const authenticated = text ? JSON.parse(text) : null;

  if (authenticated && authenticated.id) {
    const cookieStore = await cookies();
    cookieStore.set('session', authenticated.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return authenticated;
  }

  return undefined;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}