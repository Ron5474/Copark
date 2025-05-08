/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, beforeEach, vi } from 'vitest';
import '../../driver/tests/setup'
import Home from '../../driver/src/app/[locale]/page';

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
        if (x === 'card title') {
          return 'Card Title';
        }
        if (x === 'zone-prompt') {
          return 'Zone Prompt';
        }
      })
    ),
  }))

  vi.mock('@/app/[locale]/shared/actions', async () => {
    return {
      getUser: vi.fn().mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        // add more user props as needed
      }),
    };
  });

  vi.mock('next/headers', () => {
    const mockCookies = {
      get: vi.fn((name) => {
        if (name === 'auth-token') {
          return { value: 'mocked-auth-token-123' };
        }
        return null;
      }),
      getAll: vi.fn(() => [
        { name: 'auth-token', value: 'mocked-auth-token-123' },
      ]),
      set: vi.fn(),
      delete: vi.fn(),
    };

    return {
      cookies: () => mockCookies,
      headers: () => new Headers(),
    };
  });
})


it('Renders', async () => {
  await render(<Home />);
  expect(await screen.queryByLabelText('copark-logo')).not.toBeNull();
});