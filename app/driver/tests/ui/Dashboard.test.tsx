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
  expect(screen.getByText('Garage')).toBeDefined()
})

it('renders all CardButtons with correct text', () => {
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )
  expect(screen.getByText('Buy Permit')).toBeDefined()
})

it('calls setCurrentPage with garage when Garage is clicked', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(screen.getByText('Garage'))
  expect(setCurrentPage).toHaveBeenCalledWith('garage')
})

it('calls setCurrentPage with "buy-permit" when Buy Permit is clicked', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(screen.getByText('Buy Permit'))
  expect(setCurrentPage).toHaveBeenCalledWith('buy-permit')
})
