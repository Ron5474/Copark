import { render, screen } from '@testing-library/react'
import HowItWorksSection from '../src/app/[locale]/components/HowItWorksSection'
import { vi, expect, it } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      'heading': 'How CoPark Works',
      'subheading': 'Getting started with CoPark is quick and easy. Follow these simple steps to manage your parking permits.',
      'step1.title': '1. Sign Up',
      'step1.description': 'Create your CoPark account using your email.',
      'step2.title': '2. Add Your Vehicle',
      'step2.description': 'Enter your vehicle details and create a nickname for easy identification.',
      'step3.title': '3. Purchase Permits',
      'step3.description': 'Select your preferred permit type and complete your purchase with one click.',
    }

    return messages[key] || key
  }
}))

it('renders the heading, subheading, and all 3 steps', () => {
  render(<HowItWorksSection />)

  expect(screen.getByText('How CoPark Works')).toBeDefined()
  expect(
    screen.getByText(
      'Getting started with CoPark is quick and easy. Follow these simple steps to manage your parking permits.'
    )
  ).toBeDefined()

  expect(screen.getByText('1. Sign Up')).toBeDefined()
  expect(screen.getByText('Create your CoPark account using your email.')).toBeDefined()

  expect(screen.getByText('2. Add Your Vehicle')).toBeDefined()
  expect(screen.getByText('Enter your vehicle details and create a nickname for easy identification.')).toBeDefined()

  expect(screen.getByText('3. Purchase Permits')).toBeDefined()
  expect(screen.getByText('Select your preferred permit type and complete your purchase with one click.')).toBeDefined()
})
