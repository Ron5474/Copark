import { vi, it, afterEach, expect, } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import React from 'react'

import Page from '../../src/app/[locale]/signup/blank/page'
import { userLoginAttempt } from '../../src/app/[locale]/dashboard/actions'


const push = vi.fn()

vi.mock('next-auth/react', () => {
    return {
      signIn: vi.fn(),
      signOut: vi.fn(),
      SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    }
  })

vi.mock('@/app/[locale]/dashboard/actions', () => ({
    userLoginAttempt: vi.fn(),
  }))

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
      push,
      replace: vi.fn(),
    }),
    usePathname: () => '/test',
  })
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push
  }),
  Link: ({ children, href, ...props }: { children: React.ReactNode, href: string, [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
  )
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

vi.mock('../../src/app/[locale]/shared/actions', () => ({
  getUser: vi.fn().mockResolvedValue({
    user: {
      name: "Test User",
      email: "test@example.com"
    },
    expires: "2025-01-01T00:00:00.000Z"
  }),
}))

vi.mock('../../src/app/[locale]/signup/actions', () => ({
    signUp: vi.fn(),
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


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Redirects to Dashboard after successful sign up', async () => {
    vi.mocked(userLoginAttempt).mockResolvedValue('complete')
	render(<Page />)
	await waitFor(() => {
		expect(push).toHaveBeenCalledWith('/dashboard')
	})
})