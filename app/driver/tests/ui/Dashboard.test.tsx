import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach, beforeEach } from 'vitest'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import DashboardView from '@/app/[locale]/dashboard/DashboardView'
import { DashboardContext } from '@/app/[locale]/dashboard/context'
import { getLotDetails, getMyPermits } from '@/app/[locale]/dashboard/permitActions'
import { getDefaultVehicle } from '@/app/[locale]/vehicle/actions'

// Mock permitActions
vi.mock('@/app/[locale]/dashboard/permitActions', () => ({
  getLotDetails: vi.fn(),
  getMyPermits: vi.fn(),
}))

vi.mock('@/app/[locale]/vehicle/actions', () => ({
  getDefaultVehicle: vi.fn(),
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
  vi.mocked(getMyPermits).mockResolvedValue({
    active: [
      {
        vehicle: "ABC123",
        type: "Daily", 
        area: "Zone 5",
        durationType: "Zone",
        activeDate: "2025-05-27T08:00:00Z",
        expireDate: "2025-05-27T18:00:00Z"
      }
    ],
    future: [
      {
        vehicle: "ABC123",
        type: "Yearly",
        area: "All Lots Access", 
        durationType: "Yearly",
        activeDate: "2025-06-01T00:00:00Z",
        expireDate: "2026-05-31T23:59:59Z"
      }
    ],
    expired: [
      {
        vehicle: "JKL654",
        type: "Daily",
        area: "Zone 3",
        durationType: "Daily",
        activeDate: "2025-05-26T08:00:00Z", 
        expireDate: "2025-05-26T17:00:00Z"
      }
    ]
  })

  vi.mocked(getDefaultVehicle).mockResolvedValue({
    id: '123',
    plate: 'YAQ123', 
  })
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

it('clicking on Daily permits shows default vehicle', async () => {
  const user = userEvent.setup()
  render(
    <DashboardContext.Provider value={{ currentPage: 'dashboard', setCurrentPage }}>
      <DashboardView />
    </DashboardContext.Provider>
  )

  await user.click(await screen.findByText('Daily'))
  expect(await screen.findByText('Default Vehicle:')).toBeDefined()
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
