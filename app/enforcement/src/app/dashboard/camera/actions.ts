'use server'

import { cookies } from 'next/headers'

export const scanPlate = async (imageDataURL: string): Promise<string> => {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')?.value

    if (!sessionToken) throw new Error('Missing session token')

    // Get backend token from AuthService
    const authRes = await fetch('http://localhost:8000/api/v0/auth/driver/id', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    if (!authRes.ok) throw new Error('Failed to fetch backend token')

    const backendToken = await authRes.json()

    const blob = await (await fetch(imageDataURL)).blob()
    const formData = new FormData()
    formData.append('image', blob, 'capture.png')

    const response = await fetch('http://vehicle:4001/api/v0/vehicle/scan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${backendToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'OCR service error')
    }

    const data = await response.json()
    const plate = data.plate?.trim?.()

    if (!plate) throw new Error('No plate detected')

    return plate
  } catch (err) {
    console.error('scanPlate() failed:', err)
    throw err
  }
}
