import { it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GenerateReportButton from '../../src/app/components/GenerateReport'
import React from 'react'

vi.mock('../../src/report/actions', () => ({
  fetchAdminReport: vi.fn(),
}))

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('renders input, label, and button', () => {
  render(<GenerateReportButton />)
  expect(screen.getByText('Number of days:')).toBeDefined()
  expect(screen.getByRole('spinbutton')).toBeDefined()
  expect(screen.getByRole('button', { name: /Download PDF Report/i })).toBeDefined()
})

it('updates numDays when input changes', async () => {
  render(<GenerateReportButton />)
  const input = screen.getByRole('spinbutton')
  await userEvent.clear(input)
  await userEvent.type(input, '15')
  expect((input as HTMLInputElement).value).toBe('15')
})