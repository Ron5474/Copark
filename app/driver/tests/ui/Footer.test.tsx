/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, vi, beforeEach } from 'vitest';
// import userEvent from '@testing-library/user-event';

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
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
    }),
    Link: ({ children, href, ...props }: { children: React.ReactNode, href: string, [key: string]: any }) => (
      <a href={href} {...props}>{children}</a>
    ),
    usePathname: () => '/test',
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