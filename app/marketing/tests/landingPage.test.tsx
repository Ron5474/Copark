/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, beforeEach, vi } from 'vitest';
import './setup'
import Home from '../src/app/[locale]/page';

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
        if (x === 'card title') {
          return 'Card Title';
        }
        if (x === 'zone-prompt') {
          return 'Zone Prompt';
        }
      })
    ),
  }))
})


it('Renders', async () => {
  await render(<Home />);
  expect(await screen.queryByLabelText('copark-logo')).not.toBeNull();
});