import { vi, it, expect, type Mock } from 'vitest';
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


vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: '12345',
      name: 'Test User',
      email: 'hello',
    },
    expires: '2023-10-01T00:00:00.000Z',
    csrfToken: 'mock-csrf-token-123',
  }),
}));

vi.mock('next/navigation', () => ({
  getLocale: () => 'en',
  redirect: vi.fn()
}));

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
  const { redirect } = await import('next/navigation');

  await actions.Payment('en', 'permit', '12345', 500, 'some description', 'USD');
  expect(redirect).toHaveBeenCalledWith('https://mocked-payment-url.com');
});

it('getUser should return user data', async () => {
 vi.mock('next-auth/next', () => ({
    getServerSession: vi.fn().mockResolvedValue({
      user: {
        id: '12345',
        name: 'Test User',
        email: 'hello',
      },
      expires: '2023-10-01T00:00:00.000Z',
      csrfToken: 'mock-csrf-token-123',
    }),
  }));

  server.listen();
  const user = await actions.getUser();
  
  expect(user).toEqual({
    user: {
    id: '12345',
    name: 'Test User',
    email: 'hello'
  },
    expires: expect.any(String),
    csrfToken: 'mock-csrf-token-123',
  });
})

it('getUser should return null if no user is found', async () => {
  const { getServerSession } = await import('next-auth/next');
 (getServerSession as Mock).mockResolvedValue(null);
  server.listen();
  const user = await actions.getUser();
  
  expect(user).toBeUndefined();
})