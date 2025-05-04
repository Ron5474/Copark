'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login({ email, password }: { email: string; password: string }) {
  // Simulate an API call for authentication
  const response = await fetch('http://localhost:3010/api/v0/auth/login', {
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

  // Set session storage here
  if (authenticated && authenticated.name) {
    window.sessionStorage.setItem('name', authenticated.name);
  }

  return authenticated;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}