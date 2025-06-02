import { render, screen } from '@testing-library/react'
import { vi,  it, expect } from 'vitest'
import FeaturesSection from '@/app/[locale]/components/FeaturesSection'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const t: Record<string, string> = {
      heading: 'Parking Made Simple',
      subheading: 'CoPark streamlines the parking experience with powerful features designed for convenience and ease of use.',
      'feature1.title': 'One-Click Purchase',
      'feature1.description': 'Buy permits instantly with our streamlined one-click purchase process.',
      'feature1.details': 'Your default vehicle is set during signup, so you can purchase permits with a single click fast, simple, and hassle-free.',
      'feature2.title': 'Active Permit Tracking',
      'feature2.description': 'Easily view and manage all your active parking permits in one place.',
      'feature2.details': 'Never lose track of your permits again.',
      'feature3.title': 'Vehicle Management',
      'feature3.description': 'Add multiple vehicles and customize their nicknames for easy identification.',
      'feature3.details': 'Switch between vehicles effortlessly and set your default vehicle.',
      'feature4.title': 'Zone Permits',
      'feature4.description': 'Purchase permits by zone for hourly and minute-based parking needs.',
      'feature4.details': 'Zone system makes it easy to park in designated areas with flexible timing options.',
      'feature5.title': 'Flexible Duration Options',
      'feature5.description': 'Choose from daily, quarterly, or yearly permits to fit your needs.',
      'feature5.details': 'Whether you need parking for a day or a year, CoPark has flexible options to accommodate your schedule.',
      'feature6.title': 'Student Discounts',
      'feature6.description': '10% off all permits for users with .edu email addresses.',
      'feature6.details': 'We support education by offering special discounts to students and faculty members with valid academic emails.',
    }

    return t[key] || key
  },
}))

it('renders heading, subheading, and all 6 features', () => {
  render(<FeaturesSection />)

  expect(screen.getByRole('heading', { name: /Parking Made Simple/i })).toBeDefined()
  expect(screen.getByText(/streamlines the parking experience/i)).toBeDefined()

  // Feature Titles
  expect(screen.getByText(/One-Click Purchase/)).toBeDefined()
  expect(screen.getByText(/Active Permit Tracking/)).toBeDefined()
  expect(screen.getByText(/Vehicle Management/)).toBeDefined()
  expect(screen.getByText(/Zone Permits/)).toBeDefined()
  expect(screen.getByText(/Flexible Duration Options/)).toBeDefined()
  expect(screen.getByText(/Student Discounts/)).toBeDefined()

  // One detail example
  expect(
    screen.getByText(/Your default vehicle is set during signup/)
  ).toBeDefined()
})

