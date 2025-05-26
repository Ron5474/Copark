// import { render, screen, cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { vi, it, expect, afterEach } from 'vitest'
// import DashboardView from '@/app/[locale]/dashboard/DashboardView'
// import { DashboardContext } from '@/app/[locale]/dashboard/context'

// afterEach(() => {
//   cleanup()
// })

// const setCurrentPage = vi.fn()

// it('renders all CardButtons with correct text', () => {
//   render(
//     <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
//       <DashboardView />
//     </DashboardContext.Provider>
//   )
//   expect(screen.getByText('Available Permits')).toBeDefined()
// })

// it('renders all CardButtons with correct text', () => {
//   render(
//     <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
//       <DashboardView />
//     </DashboardContext.Provider>
//   )
//   expect(screen.getByText('Zone')).toBeDefined()
// })

// it('clicking on Daily permits to see avaliable permit', async () => {
//   const user = userEvent.setup()
//   render(
//     <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
//       <DashboardView />
//     </DashboardContext.Provider>
//   )

//   await user.click(screen.getByText('Daily'))
//   expect(await screen.getByLabelText('Select Lot A from Daily')).toBeDefined()
// })

// it('calls setCurrentPage with "buy-permit" when Buy Permit is clicked', async () => {
//   const user = userEvent.setup()
//   render(
//     <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
//       <DashboardView />
//     </DashboardContext.Provider>
//   )

//   await user.click(screen.getByText('Zone'))
//   expect(setCurrentPage).toHaveBeenCalledWith('buy-permit')
// })

// it('clicking on Yearly permits to see avaliable permit and selecting A then purchase', async () => {
//   const user = userEvent.setup()
//   render(
//     <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
//       <DashboardView />
//     </DashboardContext.Provider>
//   )

//   await user.click(screen.getByText('Yearly $300'))
//   await user.click(screen.getByText('Lot R - $6'))
//   expect(await screen.getByLabelText('Purchase Yearly permit enabled')).toBeDefined()
// })

// it('expands and collapses a permit card when clicked', async () => {
//   const user = userEvent.setup()

//   render(
//     <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
//       <DashboardView />
//     </DashboardContext.Provider>
//   )

//   expect(screen.queryByLabelText('Select Lot R from Yearly')).toBeNull()

//   await user.click(screen.getByText('Yearly $300'))

//   expect(screen.getByLabelText('Select Lot R from Yearly')).toBeDefined()

//   await user.click(screen.getByText('Yearly $300'))

//   expect(screen.queryByLabelText('Select Lot R from Yearly')).toBeNull()
// })

// it('expands and collapses a permit card by clicking the arrow', async () => {
//   const user = userEvent.setup()

//   render(
//     <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
//       <DashboardView />
//     </DashboardContext.Provider>
//   )

//   expect(screen.queryByLabelText('Collapse Quarterly $100')).toBeNull()

//   await user.click(screen.getByLabelText('Expand Quarterly $100'))

//   expect(screen.getByLabelText('Select Lot B from Quarterly')).toBeDefined()

//   await user.click(screen.getByLabelText('Collapse Quarterly $100'))

//   expect(screen.queryByLabelText('Select Lot B from Quarterly')).toBeNull()
// })
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach, beforeEach } from 'vitest'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import DashboardView from '@/app/[locale]/dashboard/DashboardView'
import { DashboardContext } from '@/app/[locale]/dashboard/context'
import { getLotDetails } from '@/app/[locale]/dashboard/permitActions'

// Mock permitActions
vi.mock('@/app/[locale]/dashboard/permitActions', () => ({
  getLotDetails: vi.fn()
}))

const setCurrentPage = vi.fn()

beforeEach(() => {
  vi.mocked(getLotDetails).mockResolvedValue([
    {
      id: 'daily',
      title: 'Daily',
      lots: [
        { name: 'ANY', price: '$15' },
        { name: 'Lot A', price: '$12' },
      ]
    },
    {
      id: 'quarterly',
      title: 'Quarterly',
      lots: [
        { name: 'Lot A', price: '$150' },
        { name: 'Lot B', price: '$120' },
      ]
    },
    {
      id: 'yearly',
      title: 'Yearly',
      lots: [
        { name: 'Lot R', price: '$200' },
      ]
    }
  ])
})

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it('renders all CardButtons with correct header', async () => {
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )
  expect(await screen.findByText('Available Permits')).toBeDefined()
})

it('renders Zone button', async () => {
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )
  expect(await screen.findByText('Zone')).toBeDefined()
})

it('clicking on Daily permits expands and shows available lots', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(await screen.findByText('Daily'))
  expect(await screen.findByLabelText('Select Lot A from Daily')).toBeDefined()
})

it('calls setCurrentPage with "buy-permit" when Zone is clicked', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(await screen.findByText('Zone'))
  expect(setCurrentPage).toHaveBeenCalledWith('buy-permit')
})

it('selects a lot under Yearly and enables purchase button', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(await screen.findByText('Yearly'))
  await user.click(await screen.findByText('Lot R - $200'))
  expect(await screen.findByLabelText('Purchase Yearly permit enabled')).toBeDefined()
})

it('expands and collapses a permit card on click', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  expect(screen.queryByLabelText('Select Lot R from Yearly')).toBeNull()

  await user.click(await screen.findByText('Yearly'))

  expect(await screen.findByLabelText('Select Lot R from Yearly')).toBeDefined()

  await user.click(await screen.findByText('Yearly'))

  expect(screen.queryByLabelText('Select Lot R from Yearly')).toBeNull()
})

it('expands and collapses using arrow icon', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  const expand = await screen.findByLabelText('Expand Quarterly')
  await user.click(expand)

  expect(await screen.findByLabelText('Select Lot B from Quarterly')).toBeDefined()

  const collapse = await screen.findByLabelText('Collapse Quarterly')
  await user.click(collapse)

  expect(screen.queryByLabelText('Select Lot B from Quarterly')).toBeNull()
})
