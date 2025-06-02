import { render, screen, cleanup } from '@testing-library/react'

vi.mock('@mui/icons-material/Check', () => ({
  __esModule: true,
  default: () => <span data-testid="check-icon">✓</span>,
}))


import HeroSection from '../src/app/[locale]/components/HeroSection'
import { vi, expect, it, afterEach } from 'vitest'

afterEach(() => {
  cleanup();
});
// Mock translations
vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string) => {
      const map: Record<string, string> = {
        heading: 'Manage Your Parking',
        highlight: 'Effortlessly',
        subheading: 'Find, pay, and manage your permits all in one place.',
        whyChoose: 'Why Choose CoPark?',
        benefit1: 'Easy permit management',
        benefit2: 'Secure payments',
        benefit3: 'Mobile-friendly',
        benefit4: 'Real-time updates',
        imageAlt: 'CoPark phone preview',
      }
      return map[key] || key
    }
  }
}))

it('renders heading, subheading, and benefits', () => {
  render(<HeroSection />)

  expect(screen.getByText(/Manage Your Parking/)).toBeDefined()
  expect(screen.getByText(/Effortlessly/)).toBeDefined()
  expect(screen.getByText(/Find, pay, and manage your permits/)).toBeDefined()
  expect(screen.getByText(/Why Choose CoPark/)).toBeDefined()

  expect(screen.getByText(/Easy permit management/)).toBeDefined()
  expect(screen.getByText(/Secure payments/)).toBeDefined()
  expect(screen.getByText(/Mobile-friendly/)).toBeDefined()
  expect(screen.getByText(/Real-time updates/)).toBeDefined()
})

it('renders the image with alt text', () => {
  render(<HeroSection />)
  expect(screen.getByAltText(/CoPark phone preview/)).toBeDefined()
})

