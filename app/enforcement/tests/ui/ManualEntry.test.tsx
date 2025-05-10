import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, afterEach} from 'vitest'

import ManualEntryCard from '@/app/dashboard/plate/ManualEntry'
import { EnforcementProvider } from '@/app/dashboard/context/Context'
import PermitCard from '@/app/dashboard/permit/Card'

afterEach(() => {
    cleanup()
})

it('searching sets plate from manual input', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider>
      <>
        <ManualEntryCard />
        <PermitCard />
      </>
    </EnforcementProvider>
  )

  const input = screen.getByLabelText(/license plate/i)
  await user.type(input, 'abc123')

  const searchBtn = screen.getByRole('button', { name: /search/i })
  await user.click(searchBtn)

  expect(await screen.findByText('Plate Number : ABC123')).toBeDefined()
})

it('shows error when trying to search with empty input', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider>
      <ManualEntryCard />
    </EnforcementProvider>
  )

  const input = screen.getByLabelText(/license plate/i)
  await user.clear(input)

  const searchBtn = screen.getByRole('button', { name: /search/i })
  await user.click(searchBtn)

  expect(await screen.findByText(/please enter a license plate/i)).toBeDefined()
})
  
