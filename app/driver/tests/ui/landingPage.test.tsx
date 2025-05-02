/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, vi } from 'vitest';
import Home from '../../src/app/page';

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<Home />);
  expect(await screen.queryByLabelText('copark-logo')).not.toBeNull();
});