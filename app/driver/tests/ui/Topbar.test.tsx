/**
 * @file Topbar.test.tsx
 * @description This file contains the test cases for the Topbar component.
 * @author Swayam Shah
 */

import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, afterEach, vi } from 'vitest';
import Topbar from '../../src/app/shared/topBar';

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<Topbar />);
  expect(await screen.queryByLabelText('copark-logo')).not.toBeNull();
});