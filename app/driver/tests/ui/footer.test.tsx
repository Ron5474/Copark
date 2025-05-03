/**
 * @file LandingPage.test.tsx
 * @description This file contains the test cases for the Landing Page.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, vi } from 'vitest';
import Footer from '../../src/app/shared/footer';

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<Footer />);
  expect(await screen.queryByText('Copark™')).not.toBeNull();
});

it('Test 1: Link to Do Not Sell My Personal Info', async () => {
  render(<Footer />);
  const link = await screen.getByLabelText('personal-info-link');
  expect(link.innerHTML).toBe('Do Not Sell My Personal Info');
});