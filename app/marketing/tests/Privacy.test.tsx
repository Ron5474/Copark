import { vi, it, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import Page from '../src/app/[locale]/privacy/page'

const push = vi.fn()

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Privacy Policy",
      "content title": "Your Privacy Matters",
      "Do Not Sell My Personal Info": "Do Not Sell My Personal Info",
      "Privacy Policy": "Privacy Policy",
      "Terms of Service": "Terms of Service",
      "Contact Us": "Contact Us",
      "Dark Mode": "Dark Mode",
      "Rights Reserved": "© 2025 Copark. All rights reserved.",
    }
    return translations[key] || key
  },

  NextIntlClientProvider: ({ children }: {children: React.ReactNode}) => children,
  createSharedPathnamesNavigation: () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
    }),
    usePathname: () => '/test',
  })
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push }),
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
  
it('Renders Page', async () => {
  render(<Page />)
  await screen.findByText('Your Privacy Matters')
})