import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mockCreateMiddleware = vi.fn()

vi.mock('next-intl/middleware', () => ({
  default: mockCreateMiddleware
}))

vi.mock('./i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en'
  }
}))


beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('Middleware handles requests correctly', async () => {
  const mockMiddlewareFunction = vi.fn().mockResolvedValue(NextResponse.next());
  mockCreateMiddleware.mockReturnValue(mockMiddlewareFunction);

  const { default: middleware } = await import('../src/middleware');
  const request = new NextRequest('https://example.com/en/test');

  await middleware(request);
  expect(mockMiddlewareFunction).toHaveBeenCalledWith(request);
});