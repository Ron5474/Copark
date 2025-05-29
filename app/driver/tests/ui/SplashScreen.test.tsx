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
import SplashScreen from '@/app/[locale]/onboarding/add-vehicle/SplashScreen'
import { OnboardingContext } from '@/app/[locale]/onboarding/add-vehicle/context'


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
})

afterAll(() => {
  vi.useRealTimers()
})

it('Renders Splash Screen', async () => {
  const setPage = vi.fn()
  render(
    <OnboardingContext.Provider value={{currentPage: 0, setCurrentPage: setPage}}>
        <SplashScreen />
    </OnboardingContext.Provider>
  )
  const user = userEvent.setup()
  await user.click(await screen.findByText('Add Your First Vehicle'))
  expect(setPage).toHaveBeenCalledWith(1)
})