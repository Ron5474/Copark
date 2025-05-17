'use server';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function getTransactionDetails(sessionId: string): Promise<{
  id: string;
  amount: number|null;
  currency: string|null;
  status: string;
  payment_method: string;
  
}> {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.charges', 'line_items'],
      
});
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    console.log(session.line_items)
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method as string,
    };
}