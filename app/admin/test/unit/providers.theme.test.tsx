import { render } from '@testing-library/react';
import { expect, describe, it, beforeAll } from 'vitest';
import { Providers } from '../../src/app/providers';
import theme from '../../src/app/theme';

describe('Providers and Theme', () => {
  it('should render providers without crashing', () => {
    render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    );
  });

  it('should have correct theme configuration', () => {
    // Test theme properties
    expect(theme.palette.primary.main).toBeDefined();
    expect(theme.palette.secondary.main).toBeDefined();
    expect(theme.typography).toBeDefined();
  });
});