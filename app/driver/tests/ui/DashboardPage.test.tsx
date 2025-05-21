import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach, beforeEach } from 'vitest'

import Page from '@/app/[locale]/dashboard/page'
import { getVehicles } from '../../src/app/[locale]/vehicle/actions'
import { userLoginSignUpAttempt } from '@/app/[locale]/dashboard/actions'
import { getUser } from '@/app/[locale]/shared/actions'


vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

const pushMock = vi.fn()

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => ((key: string) => {
    switch (key) {
      case 'Do Not Sell My Personal Info':
        return 'Do Not Sell My Personal Info';
      case 'Privacy Policy':
        return 'Privacy Policy';
      case 'Terms of Service':
        return 'Terms of Service';
      case 'Contact Us':
        return 'Contact Us';
      case 'Dark Mode':
        return 'Dark Mode';
      case 'Rights Reserved':
        return '© 2025 Copark. All rights reserved.';
      default:
        return key;
    }
  }),
  NextIntlClientProvider: ({ children }: {children: React.ReactNode}) => children,
  createSharedPathnamesNavigation: () => ({
    useRouter: () => ({
      push: pushMock,
      replace: vi.fn(),
    }),
    usePathname: () => '/test',
  })
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
}));

vi.mock('../../src/app/[locale]/vehicle/actions', () => ({
  getVehicles: vi.fn(),
  addVehicle: vi.fn().mockImplementation((vehicle) =>
    Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000', ...vehicle }))
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('../../src/app/[locale]/dashboard/actions', () => ({
  userLoginSignUpAttempt: vi.fn()
}))

vi.mock('../../src/app/[locale]/shared/actions', () => ({
  getUser: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

beforeEach(() => {
  vi.mocked(getVehicles).mockResolvedValue([
    {
      plate: 'ABC123',
      country: 'United States',
      state: 'California',
      nickname: 'My Car',
    },
    {
      plate: 'XYZ789',
      country: 'United States',
      state: 'New York',
      nickname: 'Work Car',
    },
    {
      plate: 'C0P4RK',
      country: 'United States',
      state: 'California',
    },
  ])
  vi.mocked(getUser).mockResolvedValue({
    user: {
      name: "Test User",
      email: "test@example.com"
    },
    expires: "2025-01-01T00:00:00.000Z"
  })
})

it('calls setCurrentPage with "buy-permit" when Buy Permit is clicked', async () => {
  const user = userEvent.setup()
  vi.mocked(userLoginSignUpAttempt).mockResolvedValue('Login/SignUp attempt successful')

  render(<Page />)

  await user.click(screen.getByText('Zone'))
  expect(await screen.findByText('Zone'))
})

it('Garage Displayed when Garage is clicked', async () => {
  const user = userEvent.setup()
  vi.mocked(userLoginSignUpAttempt).mockResolvedValue('Login/SignUp attempt successful')

  render(<Page />)

  await user.click(screen.getByText('Garage'))
  expect(await screen.findByText('+ Add Vehicle'))
})

it('Redirects to /login', async () => {
  vi.mocked(getUser).mockResolvedValue(undefined)
  vi.mocked(userLoginSignUpAttempt).mockResolvedValue('Login/SignUp attempt successful')
  render(<Page />)

  await waitFor(() => {
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})

it('Redirects to Dashboard', async () => {
  const user = userEvent.setup()
  vi.mocked(userLoginSignUpAttempt).mockResolvedValue('Login/SignUp attempt successful')
  render(<Page />)

  await user.click(screen.getByText('Garage'))
  await user.click(await screen.getByLabelText('back to dashboard'))
  expect(await screen.queryByLabelText('back to dashboard')).toBeNull()
});
