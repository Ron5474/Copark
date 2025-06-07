import { vi, beforeEach, afterAll, it, expect, beforeAll} from 'vitest';
import * as actions from '@/app/[locale]/payment-confirmation/actions';
import {http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { PermitDetails } from '@/app/[locale]/types';

vi.mock('stripe', () => {
  // Create a mock Stripe class with desired methods
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            payment_status: 'paid',
            payment_intent: {
              id: 'pi_123456789',
              amount: 1000,
              currency: 'usd',
              status: 'succeeded',
              payment_method: {
                card: {
                  brand: 'Visa',
                  last4: '4242',
                },
              },
            },
            metadata: {
              itemType: 'zone', // or 'lot' based on your test case
            },
            // add any other fields your app expects
          }),
        },
      },
    })),
  };
});

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

const paymentPort = 3014;
const paymentHandlers = [
  http.post(`http://localhost:${paymentPort}/api/v0/payment/complete`, async ({request}): Promise<HttpResponse<string>> => {
    const body = await request.json();
    if (body && typeof body === 'object' && typeof body.query === 'string' && (!body.id || !body.amount || !body.currency || !body.status || !body.payment_method || !body.type)) {
      return new HttpResponse(null, { status: 400 });
    }
    return HttpResponse.json("Payment details saved successfully", { status: 201 });
  })
];

const permitPort = 4003;
const permitHandlers = [
  http.post(`http://localhost:${permitPort}/graphql`, async ({ request }) => {
        const body = await request.json()
  
        if (body && typeof body === 'object' && typeof body.query === 'string') {
          const query = body.query
          if (query.includes(`mutation PurchasePermit($input: PurchaseZoneInput!)`)) {

          } else if (query.includes(`mutation PurchasePermit($input: PurchaseLotInput!)`)) {
          }
        } else {
        return HttpResponse.json(
          {
            errors: [{ message: 'Unknown query' }],
          },
          { status: 400 }
        )
      }
      })
]

const vehiclePort = 4001;
const vehicleHandlers = [
  http.post(`http://localhost:${vehiclePort}/graphql`, async ({ request }) => {
      const body = await request.json()
  
        if (body && typeof body === 'object' && typeof body.query === 'string') {
          const query = body.query
          if (query.includes('query defaultVehicle')) {
            return HttpResponse.json({
              data: {
                getDefaultVehicle: {
                  id: 'vehicle_123',
                  plate: 'ABC123',
                  state: 'California',
                  nickname: 'My Car'
                }
              }
            })
          } else {
            return HttpResponse.json(
              {
                errors: [{ message: 'Unknown query' }],
              },
              { status: 400 }
            )
          }
        }
      })
    ]

const ticketPort = 4002;
const ticketHandlers = [
  http.post(`http://localhost:${ticketPort}/graphql`, async ({ request }) => {
    const body = await request.json()

    if (body && typeof body === 'object' && typeof body.query === 'string') {
      const query = body.query;
      if (query.includes('mutation AddTicket')) {
        return HttpResponse.json({
          data: {
            markTicketAsPaid: {
              id: 'ticket_123',
            }
          },
        })
      } else {
        return HttpResponse.json(
          {
            errors: [{ message: 'Unknown query' }],
          },
          { status: 400 }
        )
      }
    }
  })];

const ticketServer = setupServer(...ticketHandlers);
const vehicleServer = setupServer(...vehicleHandlers);
const permitServer = setupServer(...permitHandlers);
const paymentServer = setupServer(...paymentHandlers);
beforeAll(() => {
  ticketServer.listen();
  vehicleServer.listen();
  permitServer.listen();
  paymentServer.listen();
})

afterAll(() => {
  ticketServer.close();
  vehicleServer.close();
  permitServer.close();
  paymentServer.close();
});

beforeEach(() => {
  ticketServer.resetHandlers();
  vehicleServer.resetHandlers();
  permitServer.resetHandlers();
  paymentServer.resetHandlers();
});

it('saves payment details', async () => {
  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'zone',
  };

  const result = await actions.addPaymentDetails(paymentDetails);
  expect(result).toBe("Payment details saved successfully");
});

it('fails to save payment details with invalid data', async () => {
  paymentServer.use(
    http.post(`http://localhost:${paymentPort}/api/v0/payment/complete`, async (): Promise<HttpResponse<string>> => {
       return new HttpResponse(null, { status: 400 });
    }
  ));
  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'zone',
  };
  await expect(actions.addPaymentDetails(paymentDetails)).rejects.toThrow("Failed to save payment details");
})

it('adds permit details for zone permit', async () => {
  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'zone',
  };
  const permit: PermitDetails = {
    type: 'permit',
    permitType: 'zone',
    vehicle: JSON.stringify({ id: 'vehicle_123', plate: 'ABC123',   state: 'California', nickname: 'My Car' }),
    zone: 'Zone A',
    duration: '30',
  };
  await actions.addPermitDetails(paymentDetails, permit);
  expect(true).toBe(true); // Assuming the mutation is successful, you can check the server response if needed
});

it('adds permit details for lot permit', async () => {
  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'lot',
  };
  const permit: PermitDetails = {
    type: 'permit',
    permitType: 'lot',
    vehicle: JSON.stringify({ id: 'vehicle_123', plate: 'ABC123', state: 'California', nickname: 'My Car' }),
    lot: '123',
    duration: '30',
  };

  await actions.addPermitDetails(paymentDetails, permit);
  expect(true).toBe(true); // Assuming the mutation is successful, you can check the server response if needed
});

it('adds ticket details', async () => {
  const ticketDetails = {
  type: 'ticket',
  ticketId: 'ticket_123',
  ticketFine: 50,
  };

  await actions.addTicketDetails(ticketDetails);
  expect(true).toBe(true); // Assuming the mutation is successful, you can check the server response if needed
});

it('fails to add ticket details with invalid data', async () => {
  ticketServer.use(
    http.post(`http://localhost:${ticketPort}/graphql`, async (): Promise<HttpResponse<object>> => {
      return HttpResponse.json(
        { errors: [{ message: 'Failed to save ticket details' }] },
        { status: 400 }
      );
    })
  );

  const ticketDetails = {
    type: 'ticket',
    ticketId: 'ticket_123',
    ticketFine: 50,
  };

  await expect(actions.addTicketDetails(ticketDetails)).rejects.toThrow("Failed to save ticket details");
});

it('fails to add permit details with invalid data', async () => {
  permitServer.use(
    http.post(`http://localhost:${permitPort}/graphql`, async (): Promise<HttpResponse<object>> => {
      return HttpResponse.json(
        { errors: [{ message: 'Failed to save permit details' }] },
        { status: 400 }
      );
    })
  );

  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'zone',
  };
  const permit: PermitDetails = {
    type: 'permit',
    permitType: 'zone',
    vehicle: JSON.stringify({ id: 'vehicle_123', plate: 'ABC123', state: 'California', nickname: 'My Car' }),
    zone: 'Zone A',
    duration: '30',
  };

  await expect(actions.addPermitDetails(paymentDetails, permit)).rejects.toThrow("Failed to save permit details");
});

it('fails to add payment details with invalid data', async () => {
  paymentServer.use(
    http.post(`http://localhost:${paymentPort}/api/v0/payment/complete`, async (): Promise<HttpResponse<string>> => {
      return new HttpResponse(null, { status: 400 });
    })
  );

  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'zone',
  };

  await expect(actions.addPaymentDetails(paymentDetails)).rejects.toThrow("Failed to save payment details");
});

it('get transaction details', async () => {
  const sessionId = 'session_123456789';
  const transactionDetails = await actions.getTransactionDetails(sessionId);
  expect(transactionDetails).toEqual({
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'zone',
  });
});

it('getting default vehicle errors', async () => {
  vehicleServer.use(
    http.post(`http://localhost:${vehiclePort}/graphql`, async (): Promise<HttpResponse<object>> => {
      return HttpResponse.json(
        { errors: [{ message: 'Failed to get default vehicle' }] },
        { status: 400 }
      );
    })
  );

  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'lot',
  };

  const permit: PermitDetails = {
    type: 'permit',
    permitType: 'lot',
    vehicle: JSON.stringify({ id: 'vehicle_123', plate: 'ABC123', state: 'California', nickname: 'My Car' }),
    lot: '123',
    duration: '30',
  };

  await expect(actions.addPermitDetails(paymentDetails, permit)).rejects.toThrow("Failed to fetch default Vehicle");
})

it('invalid permit type', async () => {
  const paymentDetails = {
    id: 'pi_123456789',
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    payment_method: 'Visa 4242',
    type: 'invalid_type', // Invalid permit type
  };
  const permit: PermitDetails = {
    type: 'permit',
    permitType: 'invalid_type', // Invalid permit type
    vehicle: JSON.stringify({ id: 'vehicle_123', plate: 'ABC123', state: 'California', nickname: 'My Car' }),
    zone: 'Zone A',
    duration: '30',
  };

  await expect(actions.addPermitDetails(paymentDetails, permit)).rejects.toThrow("Permit Type not resolved");
});

it('invalid ticket type', async () => {
  const ticketDetails = {
    type: 'invalid_ticket', // Invalid ticket type
    ticketId: 'ticket_123',
    ticketFine: 50,
  };

  await expect(actions.addTicketDetails(ticketDetails)).rejects.toThrow("Invalid ticket type");
});

it('invalid ticket details', async () => {
  ticketServer.use(
    http.post(`http://localhost:${ticketPort}/graphql`, async (): Promise<HttpResponse<object>> => {
      return HttpResponse.json(
        { errors: [{ message: 'Failed to save ticket details' }] },
        { status: 200 }
      );
    })
  );

  const ticketDetails = {
    type: 'ticket',
    ticketId: '', // Invalid ticket ID
    ticketFine: 50,
  };

  await expect(actions.addTicketDetails(ticketDetails)).rejects.toThrow("Failed to save ticket details: Failed to save ticket details");
})