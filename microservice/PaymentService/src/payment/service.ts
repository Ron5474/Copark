
// import * as db from "./db";
import Stripe from "stripe";
import { Checkout } from "./index";
export class PaymentService {
  async payment(
    checkoutDetails: Checkout,
    id?: string,
  ): Promise<string|null> {
    if (!id) {
      throw new Error("User ID is required");
    }
    console.log(process.env.FRONTEND_URL);
    const stripe = new Stripe(process.env.STRIPE_SECRET as string);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: checkoutDetails.currency,
            product_data: {
              name: checkoutDetails.item,
              description: checkoutDetails.description,
              images: checkoutDetails.image ? [checkoutDetails.image]: undefined, // optional
            },
            unit_amount: checkoutDetails.amount, // in cents
          },
        quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/${checkoutDetails.locale}/payment-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/${checkoutDetails.locale}`,
      metadata: {
        itemType: checkoutDetails.type,
      },
    });
    // console.log("session", session);
    return session.url;
  } 
}