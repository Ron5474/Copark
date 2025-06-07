import { it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GenerateReportButton from '../../src/app/components/GenerateReport'
import React from 'react'
import { fetchAdminReport } from '../../src/report/actions'

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

it('calls downloadBase64Pdf with base64 when fetchAdminReport succeeds', async () => {
  const base64 = 'fakebase64string';
  vi.mocked(fetchAdminReport).mockResolvedValueOnce(base64);
  const downloadSpy = vi.spyOn(document, 'createElement');
  render(<GenerateReportButton />);
  const button = screen.getByRole('button');
  await userEvent.click(button);
  await waitFor(() => {
    expect(fetchAdminReport).toHaveBeenCalled();
    expect(downloadSpy).toHaveBeenCalledWith('a');
  });
  downloadSpy.mockRestore();
});

it('alerts if fetchAdminReport returns undefined', async () => {
  vi.mocked(fetchAdminReport).mockResolvedValueOnce(undefined);
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(<GenerateReportButton />);
  const button = screen.getByRole('button');
  await userEvent.click(button);
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('Failed to generate report. Please try again.');
  });
  alertSpy.mockRestore();
});