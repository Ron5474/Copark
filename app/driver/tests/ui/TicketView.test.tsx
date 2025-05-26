/**
 * @file TicketView.test.tsx
 * @description This file contains the test cases for the TicketView.
 * @author Ronak Patel
 */

import { render, screen, cleanup, waitFor} from '@testing-library/react'
import { it, expect, afterEach, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event';

import '../setup'
import { TicketProvider, useTicketState } from '../../src/app/[locale]/ticket/TicketContext'
import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import TicketPage from '../../src/app/[locale]/ticket/TicketPage'

// const push = vi.fn()

vi.mock('@/app/[locale]/ticket/actions', () => ({
  getTickets: vi.fn().mockResolvedValue([
    {
      id: "enc_7f8a9b3c4d5e6f7g8h9i0j",
      vehicle: "Toyota Camry (ABC-1234)",
      issuedDate: "2025-05-25T14:37:42.156Z",
      violation: "Parking in no-parking zone",
      fine: 75.00,
      ticketStatus: "unpaid",
      images: "https://picsum.photos/id/19/2500/1667.jpg"
    },
    {
      id: "enc_2c3d4e5f6g7h8i9j0k1l2m",
      vehicle: "Honda Civic (XYZ-9876)",
      issuedDate: "2025-05-20T14:37:42.156Z",
      violation: "Expired meter",
      fine: 45.50,
      ticketStatus: "unpaid",
      images: "https://picsum.photos/id/19/2500/1667.jpg"
    },
    {
      id: "enc_1efd4e5fgh3h8i9j0k1l2m",
      vehicle: "Honda Accord (XYZ-9926)",
      issuedDate: "2025-04-23T14:37:42.156Z",
      violation: "No Valid Permit",
      fine: 85.50,
      ticketStatus: "unpaid",
      images: "https://picsum.photos/id/19/2500/1667.jpg"
    },
  ]),
  challengeTicket: vi.fn().mockResolvedValue({
    id: "enc_1efd4e5fgh3h8i9j0k1l2m",
    vehicle: "Honda Accord (XYZ-9926)",
    issuedDate: "2025-04-23T14:37:42.156Z",
    violation: "No Valid Permit",
    fine: 85.50,
    ticketStatus: "challenged",
    images: "https://picsum.photos/id/19/2500/1667.jpg"
  }),
}))

vi.mock('@/app/[locale]/shared/actions', () => ({
  Payment: vi.fn().mockResolvedValue("Payment attempt successful"),
}))

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
  }

  return {
    cookies: () => mockCookies,
    headers: () => new Headers(),
  }
})

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
    </TicketProvider>)
  await userEvent.click(await screen.findByText(/5\/25\/2025/))
  await screen.findByText("Parking in no-parking zone")
})

it('Click on Ticket and find Pay Button', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>)
  await userEvent.click(await screen.findByText(/4\/23\/2025/))
  await userEvent.click(await screen.findByText("Pay Ticket"))
})

it('Throw Undefined Context Error', () => {
  const TestComponent = () => {
    useTicketState()
    return <div>Testing Div</div>;
  };

  expect(() => {
    render(<TestComponent />);
  }).toThrow('Context is undefined');
})

it('Click on Challenge Ticket', async () => {
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>)
  await userEvent.click(await screen.findByText(/5\/20\/2025/))
  await userEvent.click(await screen.findByText("Challenge Ticket"))
  await screen.findByText("Reason")
})

it('Click on Challenge Ticket and Add Reason', async () => {
  const user = userEvent.setup()
  
  render(
    <TicketProvider>
      <TicketPage />
    </TicketProvider>
  )

  await user.click(await screen.findByText(/5\/20\/2025/))
  await user.click(await screen.findByText("Challenge Ticket"))
  await screen.findByText("Reason")
  const reasonInput = await screen.findByPlaceholderText("Please describe the reason for your challenge... (minimum 25 characters)")
  await user.type(reasonInput, "My reason for challenge is that I was parked at a valid spot")
  const submitButton = await screen.findByLabelText("Submit Challenge")
  await waitFor(() => {
    expect(submitButton).toBeDefined()
  })
  await user.click(submitButton)
  await screen.findByText("Ticket Challenged Successfully")
  await user.click(await screen.findByText("Go Back To Ticket"))
}, 5000)