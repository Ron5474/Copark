import { vi, it, beforeEach, expect, afterAll } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EnforcementDashboardView from '@/app/dashboard/Content'

import View from '@/app/page'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

beforeEach(() => {
  cleanup()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())

  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }]
      })
    },
    configurable: true
  })
})

afterAll(() => {
  vi.resetAllMocks()
})

it('Renders Enforcement Dashboard', async () => {
  render(
    <EnforcementProvider>
      <View />
    </EnforcementProvider>
  )
  expect(await screen.findByText('Enforcement Dashboard')).toBeDefined()
})

it('renders the camera feed title', async () => {
    render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
  )
    expect(await screen.getByText('Camera Feed')).toBeDefined()
})

it('renders Capture license plate button', () => {
    render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
    expect(screen.getByRole('button', { name: /Capture License Plate/i })).toBeDefined()
})

it('renders license plate input', () => {
  render(
    <EnforcementProvider>
      <EnforcementDashboardView />
    </EnforcementProvider>
  )
  expect(screen.getByLabelText('License Plate')).toBeDefined()
})

it('can type in the plate input', async () => {
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
  const user = userEvent.setup()
  const input = screen.getByLabelText('License Plate')
  await user.type(input, 'helloworld')
  expect((input as HTMLInputElement).value).toBe('helloworld')
})

it('Turn on camera', async () => {
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
  const user = userEvent.setup()
  const cameraOn = screen.getByLabelText('Camera Off')
  await user.click(cameraOn)
  const captureButton = screen.getByRole('button', { name: /Capture License Plate/i })
  expect(captureButton.hasAttribute('disabled')).toBe(false)

})

it('sets plate from manual input when searching', async () => {
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
  const user = userEvent.setup()
  const input = screen.getByLabelText('License Plate')
  const searchButton = screen.getByRole('button', { name: /Search/i })

  await user.type(input, 'TEST123')
  await user.click(searchButton)

  expect(await screen.findByText('TEST123')).toBeDefined()
})

it('starts a new scan and turns on camera', async () => {
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
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
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
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

it('shows camera detection note if detectionMethod is "camera"', async () => {
  render(
    <EnforcementProvider
      initialPlate="ABC123"
      initialCapturedImage="data:image/png;base64,fakeimg"
      initialDetectionMethod="camera"
    >
      <EnforcementDashboardView />
    </EnforcementProvider>
  )

  const hint = await screen.findByText(/detected via camera/i)
  expect(hint).toBeDefined()
})