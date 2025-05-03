import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../src/app/login/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../src/app/login/actions', () => ({
  login: vi.fn(),
}));

// Mock MUI icons cause they are annoying
vi.mock('@mui/icons-material', () => ({
  Visibility: () => <span>Visibility</span>,
  VisibilityOff: () => <span>VisibilityOff</span>,
}));

const mockRouter = {
  push: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (useRouter as any).mockReturnValue(mockRouter);
  window.sessionStorage.clear();
});

it('renders login form with all required elements', () => {
  render(<Page />);

  expect(screen.getByLabelText("Email Address")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByRole('button', { name: "Sign In" })).toBeDefined();
});

