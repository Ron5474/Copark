import { render, screen } from '@testing-library/react'
import TestimonialSection from '../src/app/[locale]/components/TestimonialSection'
import { vi, expect, it } from 'vitest'

// Mock next-intl translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      heading: "What Our Users Say",
      subheading: "Users trust CoPark for their parking permit needs. Here's what they have to say.",
      "testimonial1.name": "Jamie D.",
      "testimonial1.initials": "JD",
      "testimonial1.text": "CoPark has completely transformed how I manage parking permits. The one-click purchase feature saves me so much time, and I love being able to see all my active permits in one place.",
      "testimonial2.name": "Alex M.",
      "testimonial2.initials": "AM",
      "testimonial2.text": "As a student, the 10% discount with my .edu email is amazing! The zone parking feature is so convenient for when I need to park downtown for just a few hours.",
      "testimonial3.name": "Sarah K.",
      "testimonial3.initials": "SK",
      "testimonial3.text": "The vehicle management feature is fantastic. I can easily switch between my car and motorcycle when purchasing permits. The interface is clean and intuitive.",
    }

    return messages[key] || key
  },
}))


it("renders heading, subheading, and all testimonials", () => {
  render(<TestimonialSection />)

  expect(screen.getByText("What Our Users Say")).toBeDefined()
  expect(
    screen.getByText("Users trust CoPark for their parking permit needs. Here's what they have to say.")
  ).toBeDefined()

  expect(screen.getByText(/Jamie D\./)).toBeDefined()
  expect(screen.getByText(/JD/)).toBeDefined()
  expect(
    screen.getByText(/CoPark has completely transformed how I manage parking permits/)
  ).toBeDefined()

  expect(screen.getByText(/Alex M\./)).toBeDefined()
  expect(screen.getByText(/AM/)).toBeDefined()
  expect(
    screen.getByText(/the 10% discount with my \.edu email is amazing/)
  ).toBeDefined()

  expect(screen.getByText(/Sarah K\./)).toBeDefined()
  expect(screen.getByText(/SK/)).toBeDefined()
  expect(
    screen.getByText(/The vehicle management feature is fantastic/)
  ).toBeDefined()
})

