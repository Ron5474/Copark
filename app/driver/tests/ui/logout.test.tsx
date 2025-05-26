import { render, waitFor, cleanup } from '@testing-library/react';
import { vi, it, expect, afterEach } from 'vitest';

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import Page from '@/app/[locale]/dashboard/page';
import { getUser } from '@/app/[locale]/shared/actions';
import { userLoginAttempt } from '@/app/[locale]/dashboard/actions';
import { signOut } from 'next-auth/react';

vi.mock('next-auth/react', () => {
  return {
    signOut: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}))

vi.mock('@/app/[locale]/shared/actions', () => ({
  getUser: vi.fn(),
}))

vi.mock('@/app/[locale]/dashboard/actions', () => ({
  userLoginAttempt: vi.fn(),
}))

vi.mock('@/app/[locale]/dashboard/permitActions', () => ({
  getLotDetails: vi.fn().mockResolvedValue([]),
}))

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
})

it('Redirects to /driver/en/login signOut when userLoginSignUpAttempt fails', async () => {
  vi.mocked(getUser).mockResolvedValue({
    user: { name: 'Harry Pinoza', email: 'harry@pinoza.com' },
    expires: '2025-10-01T00:00:00.000Z',
  })

  vi.mocked(userLoginAttempt).mockResolvedValue(undefined)

  render(<Page />);

  await waitFor(() => {
    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: `${window.location.origin}/driver/en/login`,
    })
  })
})
