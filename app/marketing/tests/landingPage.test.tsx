/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, beforeEach, vi } from 'vitest';
import './setup'
import Home from '../src/app/[locale]/page';

const push = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
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
      })
    ),
  }))

  vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({ push }),
    usePathname: () => '/test',
  }))

  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    usePathname: () => '/test',
    useSearchParams: () => new URLSearchParams(),
  }))
})


it('Renders', async () => {
  await render(<Home />);
  const logos = await screen.queryAllByLabelText('copark-logo')
  expect(logos.length).toBeGreaterThan(0)
});
// it('renders Home component and displays content from HomeView', async () => {
//   // Mock translations used in HomeView
//   vi.doMock('next-intl', () => ({
//     useTranslations: () => (ns: string) => {
//       if (ns === 'HomeView') {
//         return (key: string) => {
//           if (key === 'cta') return 'Translated CTA'
//           return key
//         }
//       }
//       return () => ''
//     },
//   }))

//   const { default: Home } = await import('../src/app/[locale]/page')
//   render(<Home />)

//   const cta = await screen.findByText(/translated cta/i)
//   expect(cta).toBeTruthy()
// })
// import { render } from '@testing-library/react'
// import { describe, it, expect } from 'vitest'

// // Placeholder to avoid import errors; update with actual import path
// const Home = () => <div>Home Placeholder</div>

// describe('Home', () => {
//   it('renders without crashing', () => {
//     const { container } = render(<Home />)
//     expect(container).toBeTruthy()
//   })
// })
