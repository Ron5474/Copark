'use server';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function getTransactionDetails(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.charges', 'line_items'],
      
});
    console.log('Session details:', session.payment_intent);
  } catch (err) {
    console.error('Error retrieving session:', err);
    throw new Error('Failed to retrieve session');
  }
}