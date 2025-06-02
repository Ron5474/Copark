import { vi, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import GenerateReportButton from '../../src/app/components/GenerateReport'
import React from 'react'

vi.mock('../../src/report/actions', () => ({
  fetchAdminReport: vi.fn(),
}))

const mockFetchAdminReport = require('../../src/report/actions').fetchAdminReport

beforeEach(() => {
    vi.clearAllMocks()
})

it('renders input, label, and button', () => {
    render(<GenerateReportButton />)
    expect(screen.getByText('Number of days:')).toBeDefined()
    expect(screen.getByRole('spinbutton')).toBeDefined()
    expect(screen.getByRole('button', { name: /Download PDF Report/i })).toBeDefined()
})

it('updates numDays when input changes', () => {
    render(<GenerateReportButton />)
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '15' } })
    expect((input as HTMLInputElement).value).toBe('15')
})

it('shows loading state when generating', async () => {
    mockFetchAdminReport.mockImplementation(() => new Promise(() => {}))
    render(<GenerateReportButton />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Generating...')
    expect(button).toBeDisabled()
})

it('calls fetchAdminReport with correct numDays and downloads PDF on success', async () => {
    const base64 = 'fakebase64'
    mockFetchAdminReport.mockResolvedValue(base64)
    const downloadSpy = vi.spyOn(document, 'createElement')

    render(<GenerateReportButton />)
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '7' } })
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
        expect(mockFetchAdminReport).toHaveBeenCalledWith(7)
        expect(button).not.toBeDisabled()
        expect(button).toHaveTextContent('Download PDF Report')
        expect(downloadSpy).toHaveBeenCalledWith('a')
    })

    downloadSpy.mockRestore()
})

it('alerts if report generation fails', async () => {
    mockFetchAdminReport.mockResolvedValue(undefined)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<GenerateReportButton />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to generate report. Please try again.')
    })
    alertSpy.mockRestore()
})