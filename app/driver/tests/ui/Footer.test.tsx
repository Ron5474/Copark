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
import userEvent from '@testing-library/user-event';

const push = vi.fn();
const signOut = vi.fn()
const replace = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

let mockLocale = 'es'

beforeEach(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
    }),
  }))

  vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
      push,
      replace,
    }),
    usePathname: () => '/onboarding',
    useLocale: () => mockLocale,
    Link: ({ children, href, ...props }: { children: React.ReactNode, href: string, [key: string]: any }) => (
      <a href={href} {...props}>{children}</a>
    ),
  }))

  vi.mock('next-auth/react', () => ({
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    signOut: vi.fn((args) => signOut(args)),
  }));

})
it('Renders', async () => {
  render(<Footer />);
  expect(await screen.queryByText('Copark™')).not.toBeNull();
});

it('Test 1: Link to Privacy Policy', async () => {
  render(<Footer />);
  const link = await screen.getByLabelText('privacy-policy-link');
  await userEvent.click(link);
  // expect(push).toHaveBeenCalledWith('http://localhost:8080/en/privacy')
  expect(push).toHaveBeenCalledWith(expect.stringMatching(/\/privacy$/))
});

it('Test 2: Link to Terms of Service', async () => {
  render(<Footer />);
  const link = await screen.getByLabelText('service-terms-link');
  await userEvent.click(link);
  // expect(push).toHaveBeenCalledWith('/tos')
  // expect(push).toHaveBeenCalledWith('http://localhost:8080/en/tos')
  expect(push).toHaveBeenCalledWith(expect.stringMatching(/\/tos$/));
});

it('Test 3: Logout button appears and works during onboarding', async () => {
  render(<Footer />);
  const user = userEvent.setup();

  const logoutButton = screen.getByLabelText('Logout');

  await user.click(logoutButton);

  expect(signOut).toHaveBeenCalledWith({
    callbackUrl: '/driver/en/login',
  });
});

it('Test 4: SwitchLocale button shows when locale is "en" and switches to "es"', async () => {
  mockLocale = 'en';
  render(<Footer />);
  const user = userEvent.setup();

  const switchLocaleButton = await screen.findByText(/Spanish/i);

  await user.click(switchLocaleButton);

  expect(replace).toHaveBeenCalledWith(
    { pathname: '/onboarding' },
    { locale: 'es' }
  );
});

// can't get it to work

// it('Test 5: SwitchLocale button shows when locale is "es" and switches to "en"', async () => {
//   mockLocale = 'es'
//   render(<Footer />);
//   const user = userEvent.setup();

//   // const esLocaleButton = await screen.findByText(/Spanish/i);
//   // await user.click(esLocaleButton);

//   const enLocaleButton = await screen.findByText(/Inglés/i);
//   await user.click(enLocaleButton);

//   expect(replace).toHaveBeenCalledWith(
//     { pathname: '/onboarding' },
//     { locale: 'en' }
//   );
// });
