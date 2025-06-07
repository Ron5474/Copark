import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import GenerateReportButton from '../../src/app/components/GenerateReport'
import React from 'react'

// Mock next/headers cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => {
      if (name === 'session') {
        return { name: 'session', value: 'mock-auth-token' }
      }
      return undefined
    }
  })
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock createElement to avoid navigation issues with <a> tags
let anchorClickMock: ReturnType<typeof vi.fn>
// Save original reference
const realCreateElement = document.createElement

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()

  anchorClickMock = vi.fn()

  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'a') {
      return {
        set href(_) {},
        set download(_) {},
        click: anchorClickMock,
        style: {},
        setAttribute: vi.fn(),
        dispatchEvent: vi.fn(),
        remove: vi.fn(),
      } as unknown as HTMLAnchorElement
    }
    return realCreateElement.call(document, tagName)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('successfully fetches and downloads the admin report', async () => {
  // Mock fetch to return a base64 string
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: { generateReport: 'mock-base64-pdf' }
    })
  })

  render(<GenerateReportButton />)

  // Click the button
  const button = screen.getByRole('button', { name: /Download PDF Report/i })
  fireEvent.click(button)

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-auth-token'
        }),
        body: expect.stringContaining('generateReport')
      })
    )
    expect(anchorClickMock).toHaveBeenCalled()
  })
})

it('alerts if report generation fails', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      errors: [{ message: 'Failed to generate report' }]
    })
  })

  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

  render(<GenerateReportButton />)
  const button = screen.getByRole('button', { name: /Download PDF Report/i })
  fireEvent.click(button)

  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('Failed to generate report. Please try again.')
  })

  alertSpy.mockRestore()
})
