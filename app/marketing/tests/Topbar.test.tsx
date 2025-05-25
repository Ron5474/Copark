import { render, screen, cleanup } from '@testing-library/react'
import { it, expect, afterEach, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import './setup'
import Topbar from '../src/app/[locale]/components/Topbar'

const push = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push,
    }),
  }))

  vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
      push
    })
  }))

  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    usePathname: () => '/test',
    useSearchParams: () => new URLSearchParams(),
  }))
})

it('Click on Copark Icon Button', async () => {
  await render(<Topbar />);
  await userEvent.click(await screen.findByAltText("Logo"))
  expect(push).toHaveBeenCalledWith('/')
})