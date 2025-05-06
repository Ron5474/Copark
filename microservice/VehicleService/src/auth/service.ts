import { SessionUser } from '../types/express'

export class AuthService {
  public async check(authHeader?: string): Promise<SessionUser> {
    const token = authHeader?.split(' ')[1]
    if (!token) throw new Error('Unauthorized')

    const response = await fetch('http://localhost:8000/api/v0/check', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status !== 200) throw new Error('Unauthorized')

    return response.json()
  }
}
