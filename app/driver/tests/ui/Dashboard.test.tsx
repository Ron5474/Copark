import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach } from 'vitest'
import DashboardView from '@/app/[locale]/dashboard/DashboardView'
import { DashboardContext } from '@/app/[locale]/dashboard/context'

afterEach(() => {
  cleanup()
})

const setCurrentPage = vi.fn()

it('renders all CardButtons with correct text', () => {
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )
  expect(screen.getByText('Available Permits')).toBeDefined()
})

it('renders all CardButtons with correct text', () => {
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )
  expect(screen.getByText('Zone')).toBeDefined()
})

it('clicking on Daily permits to see avaliable permit', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(screen.getByText('Daily $10-15'))
  expect(await screen.getByLabelText('Select Lot A from Daily')).toBeDefined()
})

it('calls setCurrentPage with "buy-permit" when Buy Permit is clicked', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(screen.getByText('Zone'))
  expect(setCurrentPage).toHaveBeenCalledWith('buy-permit')
})

it('clicking on Yearly permits to see avaliable permit and selecting A then purchase', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(screen.getByText('Yearly $300'))
  await user.click(screen.getByText('Lot R - $6'))
  expect(await screen.getByLabelText('Purchase Yearly permit enabled')).toBeDefined()
})

it('expands and collapses a permit card when clicked', async () => {
  const user = userEvent.setup()

  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  expect(screen.queryByLabelText('Select Lot R from Yearly')).toBeNull()

  await user.click(screen.getByText('Yearly $300'))

  expect(screen.getByLabelText('Select Lot R from Yearly')).toBeDefined()

  await user.click(screen.getByText('Yearly $300'))

  expect(screen.queryByLabelText('Select Lot R from Yearly')).toBeNull()
})

it('expands and collapses a permit card by clicking the arrow', async () => {
  const user = userEvent.setup()

  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  expect(screen.queryByLabelText('Collapse Quarterly $100')).toBeNull()

  await user.click(screen.getByLabelText('Expand Quarterly $100'))

  expect(screen.getByLabelText('Select Lot B from Quarterly')).toBeDefined()

  await user.click(screen.getByLabelText('Collapse Quarterly $100'))

  expect(screen.queryByLabelText('Select Lot B from Quarterly')).toBeNull()
})