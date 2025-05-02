'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Credentials, Authenticated } from '../../auth/index'
import { authenticate, encrypt } from '../../auth/service'

export async function login(credentials: Credentials) : Promise<Authenticated|undefined> {
  const user = await authenticate(credentials)
  if (user) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const session = await encrypt(user.id)
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
