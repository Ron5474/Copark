import { vi, it, afterEach, expect, } from 'vitest'
import { render, cleanup, waitFor } from '@testing-library/react'
import React from 'react'
import { signOut } from 'next-auth/react';

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import Page from '../../src/app/[locale]/login/blank/page'
import { getUser } from '../../src/app/[locale]/shared/actions'
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

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push
  }),
  Link: ({ children, href, ...props }: { children: React.ReactNode, href: string, [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
  ),
  usePathname: () => '/test',
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

vi.mock('../../src/app/[locale]/shared/actions', () => ({
  getUser: vi.fn().mockResolvedValue({
    user: {
      name: "Test User",
      email: "test@example.com"
    },
    expires: "2025-01-01T00:00:00.000Z"
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


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders Page', async () => {
  render(<Page />)
	await waitFor(() => {
		expect(signOut).toHaveBeenCalledWith({
			callbackUrl: `/en/signup`,
		})
	})
})

it('Renders Page with correct content', async () => {
	vi.mocked(getUser).mockResolvedValue(undefined)
	render(<Page />)
	await waitFor(() => {
		expect(push).toHaveBeenCalledWith('/login')
	})
})

it('Renders Page with correct content', async () => {
	vi.mocked(getUser).mockResolvedValue({
    user: {
      name: "Test User",
      email: "test@example.com"
    },
    expires: "2025-01-01T00:00:00.000Z"
  })
	vi.mocked(userLoginAttempt).mockResolvedValue('success')
	render(<Page />)
	await waitFor(() => {
		expect(push).toHaveBeenCalledWith('/dashboard')
	})
})