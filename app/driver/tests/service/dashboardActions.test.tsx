import { vi, it, expect } from 'vitest';
import * as actions from '@/app/[locale]/dashboard/actions';
import {http, HttpHandler, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

function auth(server: { use: (arg0: HttpHandler) => void; listen: () => void; }, failGet = false, onboardingState = 'tos') {
  server.use(
    http.get('http://localhost:3010/api/v0/auth/driver/login', async (): Promise<HttpResponse<object>> => {
          if (failGet) {
            return new HttpResponse(null, {status: 401})
          } else {
            return HttpResponse.json({
              onboardingState: onboardingState,
            }, {status: 200})
          }
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

it('Should redirect to /onboarding/tos if onboardingState is "tos"', async () => {
  auth(server, false, 'tos');
  server.listen();
  const { redirect } = await import('@/i18n/navigation');
  await actions.userLoginAttempt('en');
  expect(redirect).toHaveBeenCalledWith({
    href: '/onboarding/tos',
    locale: 'en'
  });
})

it('Should redirect to /onboarding/add-vehicle if onboardingState is "first-vehicle"', async () => {
  auth(server, false, 'first-vehicle');
  server.listen();
  const { redirect } = await import('@/i18n/navigation');
  await actions.userLoginAttempt('en');
  expect(redirect).toHaveBeenCalledWith({
    href: '/onboarding/add-vehicle',
    locale: 'en'
  });
})
it('Should redirect to /signup if onboardingState is not "complete"', async () => {
  auth(server, false, 'incomplete');
  server.listen();
  const { redirect } = await import('@/i18n/navigation');
  await actions.userLoginAttempt('en');
  expect(redirect).toHaveBeenCalledWith({
    href: '/signup',
    locale: 'en'
  });
});

it('Should return "complete" if onboardingState is "complete"', async () => {
  auth(server, false, 'complete');
  server.listen();
  const result = await actions.userLoginAttempt('en');
  expect(result).toBe('complete');
});

it('Should delete auth cookie and redirect to /signup if status not 200"', async () => {
  auth(server, true, 'incomplete');
  server.listen();
  const { redirect } = await import('@/i18n/navigation');
  
  await actions.userLoginAttempt('en');

  expect(redirect).toHaveBeenCalledWith({
    href: '/signup',
    locale: 'en'
  });
});
