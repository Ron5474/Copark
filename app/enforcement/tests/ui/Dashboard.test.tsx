import { vi, it, afterEach, expect, beforeAll } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EnforcementDashboardView from '@/app/dashboard/Content'

import View from '@/app/page'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [
          { stop: vi.fn() }
        ]
      })
    }
  })
})

it('Renders Enforcement Dashboard', async () => {
  render(<View />)
  expect(await screen.findByText('Enforcement Dashboard')).toBeDefined()
})

it('renders the camera feed title', async () => {
    render(<EnforcementDashboardView />)
    expect(await screen.getByText('Camera Feed')).toBeDefined()
})

it('renders scan button', () => {
    render(<EnforcementDashboardView />)
    expect(screen.getByRole('button', { name: /Capture License Plate/i })).toBeDefined()
})

it('renders license plate input', () => {
  render(<EnforcementDashboardView />)
  expect(screen.getByLabelText('License Plate')).toBeDefined()
})

// it('shows retry button after scan fails', async () => {
//   render(<EnforcementDashboardView />)
//   const user = userEvent.setup()
//   await user.click(screen.getByRole('button', { name: /scan license plate/i }))
//   expect(await screen.findByRole('button', { name: /retry/i })).toBeDefined()
// })

it('can type in the plate input', async () => {
  render(<EnforcementDashboardView />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('License Plate')
  await user.type(input, 'helloworld')
  expect((input as HTMLInputElement).value).toBe('helloworld')
})

it('Turn on camera', async () => {
  render(<EnforcementDashboardView />)
  const user = userEvent.setup()
  const cameraOn = screen.getByLabelText('Camera Off')
  await user.click(cameraOn)
  const captureButton = screen.getByRole('button', { name: /Capture License Plate/i })
  expect(captureButton.hasAttribute('disabled')).toBe(false)

})

it('sets plate from manual input when searching', async () => {
  render(<EnforcementDashboardView />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('License Plate')
  const searchButton = screen.getByRole('button', { name: /Search/i })

  await user.type(input, 'TEST123')
  await user.click(searchButton)

  expect(await screen.findByText('TEST123')).toBeDefined()
})

it('starts a new scan and turns on camera', async () => {
  render(<EnforcementDashboardView />)
  const user = userEvent.setup()

  const input = screen.getByLabelText('License Plate')
  const searchButton = screen.getByRole('button', { name: /Search/i })
  await user.type(input, 'ABC999')
  await user.click(searchButton)

  const newScanButton = await screen.findByRole('button', { name: /New Scan/i })
  await user.click(newScanButton)

  expect(await screen.findByLabelText('Camera On')).toBeDefined()
})

it('edits a detected plate number', async () => {
  render(<EnforcementDashboardView />)
  const user = userEvent.setup()

  const input = screen.getByLabelText('License Plate')
  const searchButton = screen.getByRole('button', { name: /Search/i })
  await user.type(input, 'OLD123')
  await user.click(searchButton)

  const editButton = await screen.findByRole('button', { name: /Edit Plate Number/i })
  await user.click(editButton)

  const editInput = screen.getByLabelText('License Plate')
  await user.clear(editInput)
  await user.type(editInput, 'NEW123')

  const saveButton = screen.getByRole('button', { name: /Save/i })
  await user.click(saveButton)

  expect(await screen.findByText('NEW123')).toBeDefined()
})

// it('displays edit screen with captured image after simulated capture', async () => {
//   render(<EnforcementDashboardView />)
//   const user = userEvent.setup()

//   const cameraToggle = screen.getByLabelText('Camera Off')
//   await user.click(cameraToggle)

//   const captureButton = await screen.findByLabelText('Capture License Plate')
//   await user.click(captureButton)

//   const editButton = await screen.findByLabelText('Edit Plate Number')
//   await user.click(editButton)

//   const image = await screen.findByAltText('Captured license plate')
//   expect(image).toBeDefined()
// })
