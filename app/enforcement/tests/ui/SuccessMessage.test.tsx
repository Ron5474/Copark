import { render, screen, fireEvent, /*waitFor,*/ cleanup } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import SuccessMessage from '@/app/dashboard/violation/SuccessMessage'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
})

it('renders success message and button', () => {
  const handleClick = vi.fn()

  render(
    <EnforcementProvider>
      <SuccessMessage
        title="Violation Submitted"
        message="The violation has been recorded."
        buttonText="Back to Search"
        onButtonClick={handleClick}
      />
    </EnforcementProvider>
  )

  expect(screen.getByText('Violation Submitted')).toBeDefined()
  expect(screen.getByText('The violation has been recorded.')).toBeDefined()
  expect(screen.getByRole('button', { name: /Back to Search/i })).toBeDefined()
})

it('calls onButtonClick when button is clicked', () => {
  const handleClick = vi.fn()

  render(
    <EnforcementProvider>
      <SuccessMessage
        title="Done"
        message="Everything is fine."
        buttonText="Go Back"
        onButtonClick={handleClick}
      />
    </EnforcementProvider>
  )

  fireEvent.click(screen.getByRole('button', { name: /Go Back/i }))
  expect(handleClick).toHaveBeenCalled()
})

it('automatically calls onButtonClick after 2.5 seconds', async () => {
  const handleClick = vi.fn()

  render(
    <EnforcementProvider>
      <SuccessMessage
        title="Auto"
        message="Auto return"
        buttonText="Return"
        onButtonClick={handleClick}
      />
    </EnforcementProvider>
  )

  expect(handleClick).not.toHaveBeenCalled()

  vi.advanceTimersByTime(2500)
  await Promise.resolve()
  expect(handleClick).toHaveBeenCalled()
})
