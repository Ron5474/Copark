import { render, screen, cleanup } from '@testing-library/react'
import { it, expect, afterEach, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import './setup'
// import Footer from '../src/app/[locale]/components/Footer'

const push = vi.fn()
const replace = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetModules()
})

beforeEach(() => {
  vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({ push, replace }),
    usePathname: () => '/test',
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

const renderFooterWithLocale = async (locale = 'en') => {
  vi.doMock('next-intl', () => ({
    useLocale: () => locale,
    useTranslations: () =>
      vi.fn((x: string) => {
        if (x === 'card title') return 'Card Title'
        if (x === 'zone-prompt') return 'Zone Prompt'
        if (x === 'Get Started') return 'Get Started'
        if (x === 'Privacy Policy') return 'Privacy Policy'
        if (x === 'Terms of Service') return 'Terms of Service'
        if (x === 'Rights Reserved') return 'All Rights Reserved'
        return x
      }),
  }))

  const { default: FooterComponent } = await import('../src/app/[locale]/components/Footer')
  return render(<FooterComponent />)
}

it('Click on Privacy Policy Button', async () => {
  renderFooterWithLocale('en')
  await userEvent.click(await screen.findByText("Privacy Policy"))
  expect(push).toHaveBeenCalledWith('/privacy')
});

it('Click on Terms of Service Button', async () => {
  renderFooterWithLocale('en')
  await userEvent.click(await screen.findByText("Terms of Service"))
  expect(push).toHaveBeenCalledWith('/tos')
});

it('Click on Inglés Button triggers locale switch to en', async () => {
  renderFooterWithLocale('es')

  const button = await screen.findByRole('button', {
    name: /inglés/i,
  })

  await userEvent.click(button)

  expect(replace).toHaveBeenCalledWith({ pathname: '/test' }, { locale: 'en' })
})

it('Click on Spanish Button triggers locale switch to es', async () => {
  await renderFooterWithLocale('en')

  const button = await screen.findByRole('button', {
    name: /spanish/i,
  })

  await userEvent.click(button)

  expect(replace).toHaveBeenCalledWith({ pathname: '/test' }, { locale: 'es' })
})

it('Click on Spanish Button when already in Spanish locale does not trigger locale switch', async () => {
  await renderFooterWithLocale('es')

  await screen.findByRole('button', {
    name: /inglés/i,
  })

  vi.clearAllMocks()

  await renderFooterWithLocale('es')
  
  expect(replace).not.toHaveBeenCalled()
})