import { render, screen, cleanup } from '@testing-library/react'
import { it, expect, afterEach, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import './setup'
import Footer from '../src/app/[locale]/components/Footer'

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
        if (x === "Privacy Policy") {
            return "Privacy Policy"
        }
        if (x === "Terms of Service") {
            return "Terms of Service"
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

it('Click on Privacy Policy Button', async () => {
  await render(<Footer />);
  await userEvent.click(await screen.findByText("Privacy Policy"))
  expect(push).toHaveBeenCalledWith('/privacy')
});

it('Click on Terms of Service Button', async () => {
  await render(<Footer />);
  await userEvent.click(await screen.findByText("Terms of Service"))
  expect(push).toHaveBeenCalledWith('/tos')
});