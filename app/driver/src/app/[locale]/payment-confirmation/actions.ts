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
  
  const res = await fetch("http://localhost:3010/api/v0/payments", {
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
  if (!res.ok) {
    throw new Error("Failed to save payment details");
  }

  console.log("Payment details saved:", { id, amount, currency, status, payment_method, type });
}

export async function addPermitDetails(
  details: PaymentDetails,
  addPermitDetails: PermitDetails
): Promise<void> {
  const { id, amount, currency, status, payment_method, type } = details;
  
  const res = await fetch("http://localhost:", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAuthToken()}`,
    },
    body: JSON.stringify({
      id,
      ...addPermitDetails
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to save permit details");
  }

  console.log("Permit details saved:", { id, amount, currency, status, payment_method, type });
}
