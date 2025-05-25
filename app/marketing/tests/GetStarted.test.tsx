import { render, screen, cleanup } from '@testing-library/react'
import { it, expect, afterEach, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import './setup'
import GetStartedButton from '../src/app/[locale]/components/GetStartedButton'

const push = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push,
    }),
  }))

  vi.mock('next-intl', () => ({
    useLocale: () => 'en',
    useTranslations: () => (
      vi.fn((x: string) => {
        if (x === 'card title') {
          return 'Card Title';
        }
        if (x === 'zone-prompt') {
          return 'Zone Prompt';
        }
        if (x === 'Get Started') {
            return 'Get Started'
        }
      })
    ),
  }))

  vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
      push
    })
  }))

  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    usePathname: () => '/test',
    useSearchParams: () => new URLSearchParams(),
  }))
})

process.env.NEXT_PUBLIC_DRIVER_APP_URL = 'http://SomeWeirdSite/driver'

it('Click on Get Started Button redirects to Driver App', async () => {
  await render(<GetStartedButton />);
  await userEvent.click(await screen.findByText('Get Started'))
  expect(push).toHaveBeenCalledWith('http://SomeWeirdSite/driver/en')
});