import { render, screen } from '@testing-library/react'
import PermitSection from '../src/app/[locale]/components/PermitOptionsSection'
import { vi, expect, it } from 'vitest'

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      "heading": "Flexible Permit Options",
      "subheading":
        "Choose the permit type that best fits your parking needs. Special discounts available for .edu email users.",
      "plan1.title": "Daily Permits",
      "plan1.description": "Perfect for occasional parking needs",
      "plan2.title": "Quarterly Permits",
      "plan2.description": "Best value for regular parkers",
      "plan3.title": "Yearly Permits",
      "plan3.description": "Maximum savings for daily parkers",
      "plan4.title": "Zone Permits",
      "plan4.description":
        "Pay as you park flexibility with hourly and minute based options",
    }
    return messages[key] || key
  },
}))

it("renders heading, subheading, and all 4 permit plans", () => {
  render(<PermitSection />)

  expect(screen.getByText("Flexible Permit Options")).toBeDefined()
  expect(
    screen.getByText(
      "Choose the permit type that best fits your parking needs. Special discounts available for .edu email users."
    )
  ).toBeDefined()

  expect(screen.getByText("Daily Permits")).toBeDefined()
  expect(
    screen.getByText("Perfect for occasional parking needs")
  ).toBeDefined()

  expect(screen.getByText("Quarterly Permits")).toBeDefined()
  expect(
    screen.getByText("Best value for regular parkers")
  ).toBeDefined()

  expect(screen.getByText("Yearly Permits")).toBeDefined()
  expect(
    screen.getByText("Maximum savings for daily parkers")
  ).toBeDefined()

  expect(screen.getByText("Zone Permits")).toBeDefined()
  expect(
    screen.getByText(
      "Pay as you park flexibility with hourly and minute based options"
    )
  ).toBeDefined()
})

