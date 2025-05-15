
// import * as db from "./db";
import Stripe from "stripe";
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../../../../.env') });
export class PaymentService {
  async payment(
    item: string,
    id?: string
  ): Promise<string|null> {
    if (!id) {
      throw new Error("User ID is required");
    }
    console.log(process.env.FRONTEND_URL);
    const stripe = new Stripe(process.env.STRIPE_SECRET as string);
    if (item == "dailyPass") {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1ROYFeLROD4QlApS03E7vgcT",
          quantity: 1,
        }
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/driver`,
      cancel_url: `${process.env.FRONTEND_URL}/driver`,
    });
    console.log("session", session);
    return session.url;
  } 

    return null;
  }
}