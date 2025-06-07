import { vi, it, expect } from 'vitest';
import * as actions from '@/app/[locale]/shared/actions';
import {http, HttpHandler, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

function payment(server: { use: (...handlers: HttpHandler[]) => void; listen: () => void; }) {
  server.use(
    http.post('http://localhost:3014/api/v0/payment/pay', async () => {
      return HttpResponse.json(
        {url: 'https://mocked-payment-url.com'},
        { status: 200 }
      );
    })
  )
    };

vi.mock('@/i18n/navigation', () => {
  const mockRedirect = vi.fn();
  return {
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  redirect: mockRedirect,
};});

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

it('Should initiate payment successfully', async () => {
  payment(server);
  server.listen();
  const { redirect } = await import('@/i18n/navigation');

  await actions.Payment('permit', '12345', 500, 'some description', 'USD');
  expect(redirect).toHaveBeenCalledWith({
    href: 'https://mocked-payment-url.com',
    locale: 'en'
  });
});