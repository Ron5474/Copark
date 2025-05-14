import { render, waitFor, cleanup } from '@testing-library/react';
import { vi, it, expect, afterEach } from 'vitest';
import Page from '@/app/[locale]/dashboard/page';
import { getUser } from '@/app/[locale]/shared/actions';
import { userLoginSignUpAttempt } from '@/app/[locale]/dashboard/actions';
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
  userLoginSignUpAttempt: vi.fn(),
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

  vi.mocked(userLoginSignUpAttempt).mockResolvedValue(undefined)

  render(<Page />);

  await waitFor(() => {
    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: '/driver/en/login',
    })
  })
})
