'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(credentials: { email: string; password: string }): Promise<{ name: string } | undefined> {
  const response = await fetch('http://localhost:3010/api/v0/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  }).then(res => {console.log('weopeoperokperwwerkopwerkope'); console.log(res); return res;})

  if (response.status === 200) {
    const user = await response.json()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const session = user.session // Assuming the API returns a session token
    const cookieStore = await cookies()

    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
    return { name: user.name }
  }

  return undefined
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}