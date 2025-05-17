import { vi, it, expect, beforeEach } from 'vitest'
import { authOptions } from '../../src/app/lib/AuthConfig'
import { jwtVerify } from 'jose'


vi.mock('jose', async () => {
  const actual = await vi.importActual('jose')
  return {
    ...actual,
    SignJWT: vi.fn().mockReturnValue({
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue('mock.jwt.token')
    }),
    jwtVerify: vi.fn()
  }
})

const mockSecret = 'test-secret'
const mockToken = { 
  sub: '123456', 
  name: 'Jas Sassy', 
  email: 'ronak@user.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
}
const mockMaxAge = 3600

beforeEach(() => {
  vi.clearAllMocks()
})

it('Encode a JWT token successful', async () => {
  const { encode } = authOptions.jwt!
  
  const result = await encode({ 
    secret: mockSecret, 
    token: mockToken, 
    maxAge: mockMaxAge 
  })
  
  expect(result).toBe('mock.jwt.token')
})

it('Encode throws error if parameter missing', async () => {
  const { encode } = authOptions.jwt!
  
  await expect(encode({ 
  secret: '', 
  token: mockToken, 
  maxAge: mockMaxAge 
  })).rejects.toThrow('Missing required parameters for JWT encoding')
})

it('Decode a valid token successfully', async () => {
  const { decode } = authOptions.jwt!
  const mockPayload = { ...mockToken }
  
  vi.mocked(jwtVerify).mockResolvedValue({
    payload: mockPayload,
    protectedHeader: { alg: 'HS256' }
  } as any)
  
  const result = await decode({ 
    token: 'valid.token', 
    secret: mockSecret 
  })
  
  expect(result).toEqual(mockPayload)
expect(jwtVerify).toHaveBeenCalledWith('valid.token', expect.anything())

})

it('Decode throws error if parameter missing', async () => {
  const { decode } = authOptions.jwt!
  
  await expect(decode({ 
    token: '', 
    secret: mockSecret 
  })).rejects.toThrow('Missing required parameters for JWT decoding')
})

it('Returns null if Verification of token fails', async () => {
  const { decode } = authOptions.jwt!
  
  vi.mocked(jwtVerify).mockRejectedValue(new Error('Invalid token'))
  
  const result = await decode({ 
    token: 'invalid.token', 
    secret: mockSecret 
  })
  
  expect(result).toBeNull()
})