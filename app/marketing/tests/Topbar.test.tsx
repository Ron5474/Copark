import { render, screen, cleanup, within } from '@testing-library/react'
import { it, expect, afterEach, beforeEach, vi } from 'vitest'
import Topbar from '../src/app/[locale]/components/Topbar'

const push = vi.fn()

beforeEach(() => {
  vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({ push }),
    usePathname: () => '/test',
  }))

  vi.mock('next/navigation', () => ({
    useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() }),
    usePathname: () => '/test',
    useSearchParams: () => new URLSearchParams(),
  }))

  vi.mock('next-intl', () => ({
    useLocale: () => 'en',
    useTranslations: () => {
      const map: Record<string, string> = {
        features: 'Features',
        howItWorks: 'How It Works',
        permits: 'Permits',
        testimonials: 'Testimonials',
      }
      return (key: string) => map[key] || key
    },
  }))

  vi.mock('@mui/material/useMediaQuery', async () => {
    const actual = await vi.importActual('@mui/material/useMediaQuery')
    return {
      __esModule: true,
      ...actual,
      default: () => false,
    }
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('renders logo and handles click', () => {
  render(<Topbar />)
  expect(screen.getByText("CoPark")).toBeDefined()
})

it('renders navigation items on desktop only', () => {
  render(<Topbar />)
  const nav = screen.getByTestId('desktop-nav')
  expect(within(nav).getByText(/features/i)).toBeDefined()
  expect(within(nav).getByText(/how it works/i)).toBeDefined()
  expect(within(nav).getByText(/permits/i)).toBeDefined()
  expect(within(nav).getByText(/testimonials/i)).toBeDefined()
})
