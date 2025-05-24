/**
 * @file TicketView.test.tsx
 * @description This file contains the test cases for the TicketView.
 * @author Ronak Patel
 */

import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { it, expect, afterEach, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event';

import '../setup'
import TicketPage from '../../src/app/[locale]/ticket/TicketPage'
import { TicketProvider, useTicketState } from '../../src/app/[locale]/ticket/TicketContext'


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

it('Renders Individual Tickets', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>);
  userEvent.click(await screen.findByText('2025-03-15'))
  await screen.findByText("Parking in no-parking zone")
});

it('Click on View Photos', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>);
  userEvent.click(await screen.findByText('2025-03-15'))
  userEvent.click(await screen.findByText('View All Photos'))
  await screen.findByText("Show Less")
});

it('Click on Ticket with One Photo evidence', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>);
  userEvent.click(await screen.findByText('2025-04-02'))
  await screen.findByText("Pay Ticket")
});

it('Click on Ticket with Three Photo evidence', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>);
  userEvent.click(await screen.findByText("2025-04-03"))
  await screen.findByText("Pay Ticket")
});

it('Throw Undefined Context Error', () => {
  const TestComponent = () => {
    useTicketState()
    return <div>Testing Div</div>;
  };

  expect(() => {
    render(<TestComponent />);
  }).toThrow('Context is undefined');
});

it('Click on Challenge Ticket', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>);
  userEvent.click(await screen.findByText("2025-04-03"))
  userEvent.click(await screen.findByText("Challenge Ticket"))
  await screen.findByText("Reason")
});

it('Click on Challenge Ticket and Add Reason', async () => {
  const user = userEvent.setup()
  
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>
  )

  await user.click(await screen.findByText("2025-04-03"))
  await user.click(await screen.findByText("Challenge Ticket"))
  await screen.findByText("Reason")
  const reasonInput = await screen.findByPlaceholderText("Please describe the reason for your challenge... (minimum 25 characters)")
  await user.type(reasonInput, "My reason for challenge is that I was parked at a valid spot")
  const submitButton = await screen.findByLabelText("Submit Challenge")
  await waitFor(() => {
    expect(submitButton).toBeDefined()
  })
  await user.click(submitButton)
});