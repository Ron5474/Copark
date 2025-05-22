/**
 * @file TicketView.test.tsx
 * @description This file contains the test cases for the TicketView.
 * @author Ronak Patel
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, vi, beforeEach } from 'vitest';
// import userEvent from '@testing-library/user-event';

import '../setup'
import TicketPage from '../../src/app/[locale]/ticket/TicketPage';
import { TicketProvider } from '../../src/app/[locale]/ticket/TicketContext';

// const push = vi.fn();

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
//   vi.mock('next/navigation', () => ({
//     useRouter: () => ({
//       push: vi.fn(),
//     }),
//   }))

//   vi.mock('@/i18n/navigation', () => ({
//     useRouter: () => ({
//       push
//     })
//   }))

//   vi.mock('next-intl', () => ({
//     useLocale: () => 'en',
//     useTranslations: () => (
//       vi.fn((x: string) => {
//         switch (x) {
//           case 'Do Not Sell My Personal Info':
//             return 'Do Not Sell My Personal Info';
//           case 'Privacy Policy':
//             return 'Privacy Policy';
//           case 'Terms of Service':
//             return 'Terms of Service';
//           case 'Contact Us':
//             return 'Contact Us';
//           case 'Dark Mode':
//             return 'Dark Mode';
//           case 'Rights Reserved':
//             return '© 2025 Copark. All rights reserved.';
//           default:
//             return x;
//         }
//       })
//     ),
//   }))
})
it('Renders', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>);
  expect(await screen.queryByText('Your Tickets')).not.toBeNull();
});