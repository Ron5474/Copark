import { vi, it, afterEach, expect, beforeEach, afterAll } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../setup'
import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import PaymentConfirmationPage from '@/app/[locale]/payment-confirmation/page'

const push = vi.fn();


vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'session_id') return 'test-session-id';
      return null;
    }
  }),
  useRouter: () => ({
    push
  }),
}))

vi.mock('@/app/[locale]/shared/actions', () => ({
  getUser: vi.fn().mockResolvedValue({
    name: 'Test User',
    email: 'test@example.com',
  }),
}));


vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push
  }),
  usePathname: () => '/test',
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

vi.mock('../../src/app/[locale]/payment-confirmation/actions', () => ({
 getAuthToken: vi.fn(() => Promise.resolve('test-token')),
 getTransactionDetails: vi.fn(() => Promise.resolve({
      id: 'pi_123456789',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
      payment_method: 'Visa 4242',
      type: 'zone',
 })),
  addPaymentDetails: vi.fn(() => Promise.resolve()),
  addPermitDetails: vi.fn(() => Promise.resolve()),
  addTicketDetails : vi.fn(() => Promise.resolve())
}))


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
})

afterAll(() => {
  vi.useRealTimers()
})

it('renders', async () => {
  sessionStorage.setItem('permitDetails', JSON.stringify({
    type: 'permit',
    details: {
      permitId: 'permit_123',
      vehicle: 'Car',
      zone: 'Zone A'
    }
  }))
  render(<PaymentConfirmationPage />)
  screen.getByText('Payment Confirmed')
})

it('clicking on the button redirects to dashboard', async () => {
  sessionStorage.setItem('permitDetails', JSON.stringify({
    type: 'permit',
    details: {
      permitId: 'permit_123',
      vehicle: 'Car',
      zone: 'Zone A'
    }
  }))
  render(<PaymentConfirmationPage />)
  await waitFor(async () => {
    const button = screen.getByText('Continue to Dashboard')
    await userEvent.click(button)
  });
  await waitFor(() => {
    expect(push).toHaveBeenCalledWith('/dashboard')
  })
  sessionStorage.removeItem('permitDetails')
})

it('clicking on the button redirects to dashboard with ticket', async () => {
  sessionStorage.setItem('ticketDetails', JSON.stringify({
    type: 'ticket',
    details: {
      ticketId: 'ticket_123',
      vehicle: 'Car',
      zone: 'Zone A'
    }
  }))
  render(<PaymentConfirmationPage />)
  await waitFor(async () => {
    const button = screen.getByText('Continue to Dashboard')
    await userEvent.click(button)
  });
  await waitFor(() => {
    expect(push).toHaveBeenCalledWith('/dashboard')
  })
  sessionStorage.removeItem('ticketDetails')
})

// it('no session ID in URL', async () => {
//   vi.spyOn(console, 'error').mockImplementation(() => {});
  
//   render(<PaymentConfirmationPage />);
  
//   await waitFor(() => {
//     expect(console.error).toHaveBeenCalledWith("No session ID found in URL");
//   });
// });