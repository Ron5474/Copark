import { vi, it,  beforeAll, afterAll, afterEach, expect } from 'vitest'
import { setupServer } from 'msw/node'
import { ticketHandlers } from './mockService'
import { issueTicket } from '@/app/dashboard/violation/actions'

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn(() => ({ value: 'mock-token' })),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
  }

  return {
    cookies: () => mockCookies,
    headers: () => new Headers(),
  }
})

const server = setupServer(ticketHandlers.success)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('sends correct mutation and returns ticket data', async () => {
  const result = await issueTicket({
    plate: 'TEST123',
    state: '',
    reason: 'No Valid Permit',
    note: 'Parked in loading zone',
    images: null,
  })

  expect(result).toMatchObject({
    id: 'abc123',
    issuedDate: '2024-05-18',
    violation: 'No Valid Permit',
    fine: 75,
    ticketStatus: 'PENDING',
    images: null,
  })
})

it('throws an error if mutation fails', async () => {
  server.use(ticketHandlers.failure)

  await expect(() =>
    issueTicket({
      plate: '???',
      state: '',
      reason: 'No Valid Permit',
      images: null,
    })
  ).rejects.toThrow('Invalid plate format')
})

it('throws if no session token is found', async () => {
  const { cookies } = await import('next/headers')

  const mockCookies = cookies() as unknown as {
    get: ReturnType<typeof vi.fn>
    getAll: () => unknown[]
    set: () => void
    delete: () => void
  }

  mockCookies.get.mockImplementationOnce(() => undefined)
  await expect(() =>
    issueTicket({
      plate: 'XYZ999',
      state: '',
      reason: 'Expired Permit',
      images: null,
    })
  ).rejects.toThrow('Unauthorized: No session token found.')
})

it('throws a GraphQL error from ticket service', async () => {
  server.use(ticketHandlers.graphqlError)

  await expect(() =>
    issueTicket({
      plate: 'ERROR123',
      state: '',
      reason: 'Expired Permit',
      images: null,
    })
  ).rejects.toThrow('Ticket service internal error')
})

it('converts File to base64 and sends it in mutation', async () => {
  const dummyContent = 'test-image-content'
  const file = new File([dummyContent], 'photo.png', { type: 'image/png' })

  file.arrayBuffer = async () => {
    const uint8 = new TextEncoder().encode(dummyContent)

    const buffer = new ArrayBuffer(uint8.length)
    new Uint8Array(buffer).set(uint8)
    return buffer
  }

  const bufferSpy = vi.spyOn(Buffer, 'from')

  const result = await issueTicket({
    plate: 'IMG123',
    state: 'California',
    reason: 'Blocking Driveway',
    note: '',
    images: file,
  })

  expect(result).toMatchObject({
    id: 'abc123',
    issuedDate: '2024-05-18',
    violation: 'Blocking Driveway',
    fine: 75,
    ticketStatus: 'PENDING',
  })

  expect(bufferSpy).toHaveBeenCalledWith(expect.any(ArrayBuffer))
})

