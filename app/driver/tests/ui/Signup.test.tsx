import { vi, it, afterEach, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import View from '../../src/app/[locale]/signup/View'
import Page from '../../src/app/[locale]/signup/page'
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


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<View />)
  await screen.findByText('Sign Up')
})

it('Click Github', async () => {
  render(<View />)
  const githubButton = screen.getByText('Sign Up With GitHub')
  githubButton.click()
  const signInMock = vi.mocked(signIn)
  expect(signInMock).toHaveBeenCalledWith('github', {
    callbackUrl: '/driver/en/signup/blank'
  })
})

it('Click Google', async () => {
  render(<View />)
  const githubButton = screen.getByText('Sign Up With Google')
  githubButton.click()
  const signInMock = vi.mocked(signIn)
  expect(signInMock).toHaveBeenCalledWith('google', {
    callbackUrl: '/driver/en/signup/blank'
  })
})

it('Click Facebook', async () => {
  render(<View />)
  const githubButton = screen.getByText('Sign Up With Facebook')
  githubButton.click()
  const signInMock = vi.mocked(signIn)
  expect(signInMock).toHaveBeenCalledWith('facebook', {
    callbackUrl: '/driver/en/signup/blank'
  })
})

it('Renders Page', async () => {
  render(<Page />)
  await screen.findByText('Sign Up')
})

