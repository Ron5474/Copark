'use server';
import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { PaymentDetails, PermitDetails } from '../types';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)



async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);
  return authCookie?.value as string;
}

export async function getTransactionDetails(sessionId: string): Promise<PaymentDetails> {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.charges', 'line_items'],
      
});
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method as string,
      type: session.metadata?.itemType as string,
    };
}

export async function addPaymentDetails(
  details: PaymentDetails
): Promise<void> {
  const { id, amount, currency, status, payment_method, type } = details;
  
  const res = await fetch("http://localhost:3014/api/v0/payment/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAuthToken()}`,
    },
    body: JSON.stringify({
      id,
      amount,
      currency,
      status,
      payment_method,
      type,
    }),
  });

  if (res.status !== 201 && res.status !== 200 && res.status !== 204) {
    throw new Error("Failed to save payment details");
  }
}

export async function addPermitDetails(
  details: PaymentDetails,
  addPermitDetails: PermitDetails
): Promise<void> {
  const { id, amount, currency, status, payment_method, type } = details;
  const { vehicle, zoneNumber, duration } = addPermitDetails;

  const inputData = {
    vehicle: vehicle?.plate,
          zone: zoneNumber,
          duration: duration,
          paymentMethod: payment_method
        }

  const res = await fetch("http://localhost:4003/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAuthToken()}`,
    },
    body: JSON.stringify({
      query: `
        mutation PurchaseZonePermit($input: PurchaseZoneInput!) {
          purchaseZonePermit(input: $input) {
            zone,
            purchaseDate,
            activeDate,
            expireDate,
            receipt {
              tax,
              service,
              subTotal,
              total
            }
            paymentMethod
          }
        }
        `,
      variables: {
        input: inputData
      }
    }),
  });

  const result = await res.json();
  
  console.log("GraphQL response:", result);

  if (await result.errors !== undefined) {
    throw new Error("Failed to save permit details");
  }

  console.log("Permit details saved:", { id, amount, currency, status, payment_method, type });
}
