/**
 * @file Topbar.test.tsx
 * @description This file contains the test cases for the Topbar component.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, beforeEach, vi } from 'vitest';
import Topbar from '../../src/app/[locale]/shared/Topbar';

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

  vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
    handler: vi.fn(),
    GET: vi.fn(),
    POST: vi.fn(),
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
  render(<Topbar />);
  expect(await screen.queryByLabelText('copark-logo')).not.toBeNull();
});