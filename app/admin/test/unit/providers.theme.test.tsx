import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Providers } from '../../src/app/providers';
import theme from '../../src/app/theme';

vi.mock('geist/font/sans', () => ({
  GeistSans: { variable: 'mocked-sans-variable' }
}));

vi.mock('geist/font/mono', () => ({
  GeistMono: { variable: 'mocked-mono-variable' }
}));

it('should render providers without crashing', () => {
  render(
    <Providers>
      <div>Test Child</div>
    </Providers>
  );
});

it('should have correct theme configuration', () => {
  expect(theme.palette.primary.main).toBeDefined();
  expect(theme.palette.secondary.main).toBeDefined();
  expect(theme.typography).toBeDefined();
});

it('should have correct primary color', () => {
  expect(theme.palette.primary.main).toBe('#41A9AB');
});

it('should have correct secondary color', () => {
  expect(theme.palette.secondary.main).toBe('#F45A59');
});