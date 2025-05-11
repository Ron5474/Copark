// import { render, screen, cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { it, expect, afterEach} from 'vitest'

// import ManualEntryCard from '@/app/dashboard/plate/ManualEntry'
// import { EnforcementProvider } from '@/app/dashboard/context/Context'
// import PermitCard from '@/app/dashboard/permit/Card'

// afterEach(() => {
//     cleanup()
// })

// it('searching sets plate from manual input', async () => {
//   const user = userEvent.setup()

//   render(
//     <EnforcementProvider>
//       <>
//         <ManualEntryCard />
//         <PermitCard />
//       </>
//     </EnforcementProvider>
//   )

//   const input = screen.getByLabelText(/license plate/i)
//   await user.type(input, 'abc123')

//   const searchBtn = screen.getByRole('button', { name: /search/i })
//   await user.click(searchBtn)

//   expect(await screen.findByText('Plate Number : ABC123')).toBeDefined()
// })

// it('shows error when trying to search with empty input', async () => {
//   const user = userEvent.setup()

//   render(
//     <EnforcementProvider>
//       <ManualEntryCard />
//     </EnforcementProvider>
//   )

//   const input = screen.getByLabelText(/license plate/i)
//   await user.clear(input)

//   const searchBtn = screen.getByRole('button', { name: /search/i })
//   await user.click(searchBtn)

//   expect(await screen.findByText(/please enter a license plate/i)).toBeDefined()
// })
  
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, afterEach, vi } from 'vitest'

import ManualEntryCard from '@/app/dashboard/plate/ManualEntry'
import { EnforcementProvider } from '@/app/dashboard/context/Context'
import PermitCard from '@/app/dashboard/permit/Card'

// Mock checkPermit
vi.mock('@/app/dashboard/permit/actions', async () => {
  return {
    checkPermit: vi.fn(async () => ({
      isValid: true,
      type: 'Residential',
      zone: 'A1',
    })),
  }
})

afterEach(() => {
  cleanup()
})

it('shows error when trying to search with empty input', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider>
      <ManualEntryCard />
    </EnforcementProvider>
  )

  const searchBtn = screen.getByLabelText('Search')
  await user.click(searchBtn)

  expect(await screen.findByText(/please enter a license plate and zone/i)).toBeDefined()
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

  const plateInput = screen.getByLabelText(/license plate/i)
  const zoneInput = screen.getByLabelText(/zone/i)
  const searchBtn = screen.getByLabelText('Search')

  await user.type(plateInput, 'abc123')
  await user.type(zoneInput, 'A1')
  await user.click(searchBtn)

  expect(screen.getByText(/Valid parking permit found/i)).toBeDefined()
})
