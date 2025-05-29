import { vi, it, afterEach, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { signIn } from 'next-auth/react'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import View from '../../src/app/[locale]/login/View'
import Page from '../../src/app/[locale]/login/page'
import React from 'react'

const push = vi.fn()


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

it('Renders', async () => {
  render(<View />)
  await screen.findByText('Log In')
})

it('Click Github', async () => {
  render(<View />)
  const githubButton = screen.getByText('Sign In With GitHub')
  githubButton.click()
  const signInMock = vi.mocked(signIn)
  expect(signInMock).toHaveBeenCalledWith('github', {
    callbackUrl: '/driver/en/login/blank'
  })
})

it('Click Google', async () => {
  render(<View />)
  const githubButton = screen.getByText('Sign In With Google')
  githubButton.click()
  const signInMock = vi.mocked(signIn)
  expect(signInMock).toHaveBeenCalledWith('google', {
    callbackUrl: '/driver/en/login/blank'
  })
})

it('Click Facebook', async () => {
  render(<View />)
  const githubButton = screen.getByText('Sign In With Facebook')
  githubButton.click()
  const signInMock = vi.mocked(signIn)
  expect(signInMock).toHaveBeenCalledWith('facebook', {
    callbackUrl: '/driver/en/login/blank'
  })
})

it('Renders Page', async () => {
  render(<Page />)
  await screen.findByText('Log In')
})

