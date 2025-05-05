import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, beforeEach, afterAll } from 'vitest'
import CameraCaptureCard from '@/app/dashboard/camera/CameraBox'
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


it('toggles camera on and off', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider>
      <CameraCaptureCard />
    </EnforcementProvider>
  )

  const toggleButton = screen.getByRole('button', { name: /camera off/i })

  await user.click(toggleButton)
  expect(await screen.findByRole('button', { name: /camera on/i })).toBeDefined()
})

it('disables capture button when camera is off', () => {
  render(
    <EnforcementProvider>
      <CameraCaptureCard />
    </EnforcementProvider>
  )

  const captureButton = screen.getByRole('button', { name: /capture license plate/i })
  expect(captureButton.getAttribute('disabled')).not.toBeNull()
})
