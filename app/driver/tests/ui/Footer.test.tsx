/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, vi, beforeEach } from 'vitest';
import Footer from '../../src/app/[locale]/shared/Footer';

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
  await render(<Footer />);
  expect(await screen.queryByText('Copark™')).not.toBeNull();
});

it('Test 1: Link to Do Not Sell My Personal Info', async () => {
  await render(<Footer />);
  const link = await screen.getByLabelText('personal-info-link');
  expect(link.innerHTML).toBe('Do Not Sell My Personal Info');
});