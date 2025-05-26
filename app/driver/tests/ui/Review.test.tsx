/**
 * @file Zone.test.tsx
 * @description This file contains the test cases for the Zone step in zone checkout.
 * @author Bryant Oliver
 */

import { vi, it, afterEach, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import '../setup'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
// import MemberView from '../../src/app/[locale]/zone/View'
import Review from '../../src/app/[locale]/zone/Review'
// import { ZoneContext } from '../../src/app/[locale]/zone/Context'


vi.mock('../../src/app/[locale]/Vehicle/actions', () => ({
  getVehicles: vi.fn().mockResolvedValue([{
    plate: 'C0P4RK',
    country: 'United States',
    state: 'California',
  }]),
  addVehicle: vi.fn().mockImplementation((vehicle) =>
    Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000', ...vehicle }))
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  handler: vi.fn(),
  GET: vi.fn(),
  POST: vi.fn(),
}))

vi.mock('@/app/[locale]/shared/actions', () => ({
  getUser: vi.fn().mockResolvedValue({
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/image.jpg',
  }),
}))

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn((name) => {
      if (name === 'auth-token') {
        return { value: 'mocked-auth-token-123' };
      }
      return null;
    }),
    getAll: vi.fn(() => [
      { name: 'auth-token', value: 'mocked-auth-token-123' },
    ]),
    set: vi.fn(),
    delete: vi.fn(),
  }

  return {
    cookies: () => mockCookies,
    headers: () => new Headers(),
  }
})

// type Vehicle = React.ContextType<typeof ZoneContext>['vehicle']

// vi.mock('../../src/app/[locale]/zone/Context', async () => {
//   console.log("HIT MOCK CONTEXT")
//   const actual = await vi.importActual<typeof import('../../src/app/[locale]/zone/Context')>(
//     '../../src/app/[locale]/zone/Context'
//   )

//   const { createContext, useState } = await vi.importActual<typeof import('react')>('react')

//   const ZoneContext = createContext<React.ContextType<typeof actual.ZoneContext>>({
//     currentStep: 'Duration',
//     setCurrentStep: () => {},
//     zoneNumber: '',
//     setZoneNumber: () => {},
//     vehicle: undefined,
//     setVehicle: () => {},
//     next: () => {},
//   })

//   const ZoneProvider = ({ children }: { children: React.ReactNode }) => {
//     const [currentStep, setCurrentStep] = useState('Duration')
//     const [zoneNumber, setZoneNumber] = useState('')
//     const [vehicle, setVehicle] = useState<Vehicle | undefined>()

//     const next = () => {
//       console.log("HIT MOCK NEXT")
//       const index = actual.steps.indexOf(currentStep)
//       const nextStep = actual.steps[index + 1]
//       if (nextStep) setCurrentStep(nextStep)
//     }

//     return (
//       <ZoneContext.Provider
//         value={{ currentStep, setCurrentStep, zoneNumber, setZoneNumber, vehicle, setVehicle, next }}
//       >
//         {children}
//       </ZoneContext.Provider>
//     )
//   }

//   return {
//     ...actual,
//     ZoneContext,
//     ZoneProvider,
//   }
// })


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})


it('Renders Payment', async () => {
  render(<Review />)
  expect(await screen.findByText('Review Order')).toBeDefined()
})
