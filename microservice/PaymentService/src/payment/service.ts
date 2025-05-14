import Stripe from "stripe";

export class PaymentService {
  async payment(
    item: string,
    id?: string
  ): Promise<string|null> {
    if (!id) {
      throw new Error("User ID is required");
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET as string);
    if (item == "dailyPass") {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal", "amazon_pay"],
      line_items: [
        {
          price: "price_1ROYFeLROD4QlApS03E7vgcT",
          quantity: 1,
        }
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    return session.url;
  } 

    return null;
  }
}