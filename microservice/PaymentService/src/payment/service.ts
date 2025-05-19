
import { pool } from "./db";
import Stripe from "stripe";
import { Checkout, PaymentDetails } from "./index";
export class PaymentService {
  public async payment(
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

  public async completePayment(
    details: PaymentDetails,
    id?: string,
  ): Promise<string|undefined> {
    if (!id) {
      throw new Error("User ID is required");
    }
    const query = {
      text: `INSERT INTO payments(driver, data) SELECT $1, jsonb_build_object(` +
      `'paymentId', $2::text,` +
      `'currency', $3::text,` +
      `'amount', $4::text,` +
      `'status', $5::text,` +
      `'payment_method', $6::text,` +
      `'type', $7::text,` +
      `'created_at', now()` + 
      `) WHERE NOT EXISTS (SELECT 1 FROM payments WHERE data->>'paymentId' = $2::text) ` +
      `RETURNING id`,
      values: [
        id,
        details.id,
        details.currency,
        details.amount,
        details.status,
        details.payment_method,
        details.type,
      ],
    }

    const res = await pool.query(query);
    if (res.rowCount === 0) {
      return undefined;
    }
    const paymentId = res.rows[0].id;
    return paymentId;
  }  
}