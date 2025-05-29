import { it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageTicketChallenges from '../../src/app/components/ManageTicketChallenges';
import {
  acceptTicketChallenge,
  rejectTicketChallenge,
  getChallengedTickets,
  getAcceptedTickets
} from '../../src/ticket/actions';

// Mock all actions
vi.mock('../../src/ticket/actions', () => ({
  acceptTicketChallenge: vi.fn(),
  rejectTicketChallenge: vi.fn(),
  getChallengedTickets: vi.fn(),
  getAcceptedTickets: vi.fn()
}));

// Mock data
const mockChallengedTickets = [
  {
    id: '123',
    vehicle: 'ABC123',
    enforcer: '456',
    issuedDate: new Date().toISOString(),
    violation: 'No Permit',
    fine: 50,
    ticketStatus: 'challenged',
    images: 'test.jpg',
    note: 'Test note',
    challengeReason: 'I had a valid permit'
  }
];

const mockAcceptedTickets = [
  {
    id: '789',
    vehicle: 'XYZ789',
    enforcer: '012',
    issuedDate: new Date().toISOString(),
    violation: 'No Permit',
    fine: 50,
    ticketStatus: 'accepted',
    images: 'test.jpg',
    note: 'Test note'
  }
];

// Add to mock data section
const mockTicketWithMultipleImages = [
  {
    id: '456',
    vehicle: 'DEF456',
    enforcer: '789',
    issuedDate: new Date().toISOString(),
    violation: 'Invalid Parking',
    fine: 75,
    ticketStatus: 'challenged',
    images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    note: 'Multiple evidence photos',
    challengeReason: 'The signs were not visible'
  }
];

// Setup and cleanup
beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  (getChallengedTickets as Mock).mockResolvedValue(mockChallengedTickets);
  (getAcceptedTickets as Mock).mockResolvedValue(mockAcceptedTickets);
});

it('renders challenged tickets correctly', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  expect(screen.getByText(/Active Challenges: 1/)).toBeDefined();
  expect(screen.getByText('ABC123')).toBeDefined();
  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();
  expect(screen.getByText('I had a valid permit')).toBeDefined();
});

it('displays empty state when no tickets exist', async () => {
  (getChallengedTickets as Mock).mockResolvedValue([]);

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  expect(screen.getByText('No challenged tickets found.')).toBeDefined();
});

it('handles accepting a ticket challenge successfully', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const acceptButton = screen.getByRole('button', { name: /Accept Challenge/ });
  await userEvent.click(acceptButton);

  expect(acceptTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2); // Initial load + after accept
});

it('handles accepting a ticket challenge with error', async () => {
  (acceptTicketChallenge as Mock).mockRejectedValueOnce(new Error('Failed to accept challenge'));

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const acceptButton = screen.getByRole('button', { name: /Accept Challenge/ });
  await userEvent.click(acceptButton);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to accept challenge')).toBeDefined();
  });
});

it('handles rejecting a ticket challenge successfully', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const rejectButton = screen.getByRole('button', { name: /Reject Challenge/ });
  await userEvent.click(rejectButton);

  expect(rejectTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2); // Initial load + after reject
});

it('handles rejecting a ticket challenge with error', async () => {
  (rejectTicketChallenge as Mock).mockRejectedValueOnce(new Error('Failed to reject challenge'));

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const rejectButton = screen.getByRole('button', { name: /Reject Challenge/ });
  await userEvent.click(rejectButton);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to reject challenge')).toBeDefined();
  });
});

it.only('renders single image evidence correctly', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const image = screen.getByLabelText('Violation evidence');
  expect(image).toBeDefined();
  expect(image).toHaveProperty('src', 'test.jpg');
});

// it('renders multiple images evidence correctly', async () => {
//   (getChallengedTickets as Mock).mockResolvedValue(mockTicketWithMultipleImages);

//   render(<ManageTicketChallenges />);

//   await waitFor(() => {
//     expect(screen.queryByRole('progressbar')).toBeNull();
//   });

//   // First wait for the Evidence label to appear (indicates images are loaded)
//   await waitFor(() => {
//     expect(screen.getByText('Evidence:')).toBeDefined();
//   });

//   const images = screen.getAllByAltText(/Violation evidence \d+/);
//   expect(images).toHaveLength(3);
  
//   // Check each image's src attribute
//   expect(images[0]).toHaveProperty('src', 'image1.jpg');
//   expect(images[1]).toHaveProperty('src', 'image2.jpg');
//   expect(images[2]).toHaveProperty('src', 'image3.jpg');

//   // Verify images are rendered with correct styling
//   images.forEach(image => {
//     expect(image.style).contains({
//       maxWidth: '200px',
//       borderRadius: '8px'
//     });
//   });
// });

// it('handles image validation callback correctly', async () => {
//   render(<ManageTicketChallenges />);

//   await waitFor(() => {
//     expect(screen.queryByRole('progressbar')).toBeNull();
//   });

//   const image = screen.getByLabelText('Violation evidence');
//   expect(image).toBeDefined();

//   // Simulate successful image load by firing onLoad event
//   await userEvent.click(image);
//   expect(screen.getByText('Evidence:')).toBeDefined();
// });
