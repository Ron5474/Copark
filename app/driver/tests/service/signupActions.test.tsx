import { vi, it, expect } from 'vitest';
import * as actions from '@/app/[locale]/signup/actions';
import {http, HttpHandler, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

function auth(server: { use: (...handlers: HttpHandler[]) => void; listen: () => void; }, failGet = false, return204 = false ) {
  server.use(
    http.post('http://localhost:3010/api/v0/auth/driver/signup', async (): Promise<HttpResponse<object>> => {
      if (failGet) {
        return new HttpResponse(null, { status: 401 });
      } else {
        if (return204) {
          return HttpResponse.json({}, { status: 204 });
        } else {
          return HttpResponse.json({ onboardingState: 'tos' }, { status: 201 });
        }
      }
    }),
    http.put('http://localhost:3010/api/v0/auth/driver/onboarding', async ({ request }) => {
      const body = await request.json();
      if (body && typeof body === 'object' && typeof body.newState === 'string' && failGet === false) {
        return HttpResponse.json({}, { status: 200 });
      } else {
        return HttpResponse.json({ error: 'Invalid request' }, { status: 400 });
      }
    })
  );
}

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

it('Should sign up successfully', async () => {
  auth(server, false);
  server.listen();

  const result = await actions.signUp('en');
  
  expect(result).toBeUndefined();
});

it('Should handle sign up failure', async () => {
  auth(server, true);
  server.listen();

  await expect(actions.signUp('en')).rejects.toThrow("Error signing up");
});

it('Should set onboarding state successfully', async () => {
  auth(server, false);
  server.listen();

  await actions.setOnBoardingState('first-vehicle');
  
  const cookieStore = await (await import('next/headers')).cookies();
  expect(cookieStore.get('auth-token')).toBeDefined();
});

it('Should redirect to /driver/login after successful sign up', async () => {
  auth(server, false, true);
  server.listen();
  
  const { redirect } = await import('@/i18n/navigation');
  await actions.signUp('en');
  
  expect(redirect).toHaveBeenCalledWith({
    href: '/driver/login',
    locale: 'en'
  });
});

it('Should handle error when setting onboarding state fails', async () => {
  auth(server, true);
  server.listen();

  await expect(actions.setOnBoardingState('first-vehicle')).rejects.toThrow("Error setting onboarding state");
});
