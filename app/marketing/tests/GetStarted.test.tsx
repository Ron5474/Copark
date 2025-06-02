import { render, screen, cleanup } from '@testing-library/react'
import { it, expect, afterEach, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import './setup'
import GetStartedButton from '../src/app/[locale]/components/GetStartedButton'

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

  vi.mock('next-intl', () => ({
    useLocale: () => 'en',
    useTranslations: () => (
      vi.fn((x: string) => {
        if (x === 'card title') {
          return 'Card Title';
        }
        if (x === 'zone-prompt') {
          return 'Zone Prompt';
        }
        if (x === 'Get Started') {
            return 'Get Started'
        }
      })
    ),
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

process.env.NEXT_PUBLIC_DRIVER_APP_URL = 'http://SomeWeirdSite/driver'

// it('Click on Get Started Button redirects to Driver App', async () => {
//   await render(<GetStartedButton />);
//   await userEvent.click(await screen.findByText('Get Started'))
//   expect(push).toHaveBeenCalledWith('http://SomeWeirdSite/driver/en')
// });

it('renders with provided label and triggers router on click', async () => {
  const mockClick = vi.fn()
  render(<GetStartedButton label="Start Here" onClick={mockClick} />)

  const button = screen.getByRole('button', { name: /go-to-login/i })
  await userEvent.click(button)

  expect(mockClick).toHaveBeenCalledTimes(1)
})

it('renders fallback label from useTranslations when no label is passed', async () => {
  vi.resetModules();

  vi.doMock('next-intl', () => ({
    useTranslations: () => (ns: string) => {
      if (ns === 'label') return 'Fallback Translated Label';
      return () => 'Fallback Translated Label';
    },
  }));

  const mockClick = vi.fn();

  const { default: GetStartedButton } = await import('../src/app/[locale]/components/GetStartedButton');

  render(<GetStartedButton onClick={mockClick} />);

  const button = await screen.findByRole('button', { name: /go-to-login/i });

  const visibleText = button.textContent?.trim();
  expect(visibleText).toMatch(/fallback translated label/i);

  await userEvent.click(button);
  expect(mockClick).toHaveBeenCalled();
});
