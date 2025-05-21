/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

import '../setup'
import Footer from '../../src/app/[locale]/shared/Footer';

const push = vi.fn();

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

  vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
      push
    })
  }))

  vi.mock('next-intl', () => ({
    useLocale: () => 'en',
    useTranslations: () => (
      vi.fn((x: string) => {
        switch (x) {
          case 'Do Not Sell My Personal Info':
            return 'Do Not Sell My Personal Info';
          case 'Privacy Policy':
            return 'Privacy Policy';
          case 'Terms of Service':
            return 'Terms of Service';
          case 'Contact Us':
            return 'Contact Us';
          case 'Dark Mode':
            return 'Dark Mode';
          case 'Rights Reserved':
            return '© 2025 Copark. All rights reserved.';
          default:
            return x;
        }
      })
    ),
  }))
})
it('Renders', async () => {
  render(<Footer />);
  expect(await screen.queryByText('Copark™')).not.toBeNull();
});

// it('Test 1: Link to Privacy Policy', async () => {
//   render(<Footer />);
//   const link = await screen.getByLabelText('privacy-policy-link');
//   await userEvent.click(link);
//   expect(push).toHaveBeenCalledWith('/privacy')
// });

// it('Test 2: Link to Terms of Service', async () => {
//   render(<Footer />);
//   const link = await screen.getByLabelText('service-terms-link');
//   await userEvent.click(link);
//   expect(push).toHaveBeenCalledWith('/tos')
// });