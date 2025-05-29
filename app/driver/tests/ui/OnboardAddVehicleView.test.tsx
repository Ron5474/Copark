/**
 * @file Vehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Ronak Patel
 */

import { vi, it, afterEach, expect, beforeEach, afterAll } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../setup'
import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import AddVehicleView from '@/app/[locale]/onboarding/add-vehicle/AddVehicleView'

const push = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push
  }),
  usePathname: () => '/test',
}))

vi.mock('../../src/app/[locale]/vehicle/actions', () => ({
  addVehicle: vi.fn().mockImplementation((vehicle) =>
    Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000', ...vehicle })),
  getDefaultVehicle: vi.fn().mockResolvedValue({ plate: 'ABC123' }),
}))

vi.mock('@/app/[locale]/signup/actions', () => ({
  setOnBoardingState: vi.fn()
}))


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
})

afterAll(() => {
  vi.useRealTimers()
})

it('Adding vehicle continues to Dashboard', async () => {
  render(<AddVehicleView />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('Enter license plate number')
  await user.type(input, 'TEST123')

  await user.click(await screen.findByLabelText('Submit vehicle'))
  expect(push).toHaveBeenCalledWith('/dashboard')
})