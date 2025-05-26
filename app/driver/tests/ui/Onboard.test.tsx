import { vi, it, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import View from '../../src/app/[locale]/onboarding/tos/View'
import Page from '../../src/app/[locale]/onboarding/tos/page'

const push = vi.fn()


vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

vi.mock('../../src/app/[locale]/shared/actions', () => ({
  getUser: vi.fn().mockResolvedValue({
    user: {
      name: "Test User",
      email: "test@example.com"
    },
    expires: "2025-01-01T00:00:00.000Z"
  }),
}))

vi.mock('@/app/[locale]/signup/actions', () => ({
  signUp: vi.fn(),
  setOnBoardingState: vi.fn()
}))



afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<View />)
  await screen.findByText('Terms of Service')
})

it('Accept TOS and Click Continue', async () => {
    render(<View />)
    const TOSButton = screen.getByLabelText('I have read and agree to the Terms of Service')
    TOSButton.click()
    const next = screen.getByText('Continue')
    next.click()
})
  
it('Renders Page', async () => {
  render(<Page />)
  await screen.findAllByText('Terms of Service')
})