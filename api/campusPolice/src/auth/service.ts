import { SessionUser } from '../'

export class AuthService {
  public async check(authHeader?: string, scopes?: string[]): Promise<SessionUser> {
    const token = authHeader?.split(' ')[1]
    if (!token) throw new Error('Unauthorized')

    const response = await fetch('http://localhost:3010/api/v0/auth/check', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scopes)
    })

    if (response.status !== 200) throw new Error('Unauthorized')

    return response.json()
  }
}
