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
      expand: ['payment_intent.charges', 'line_items', 'payment_intent.payment_method'],
      
});
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    const paymentMethod = paymentIntent.payment_method as Stripe.PaymentMethod;
    
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method: paymentMethod.card ? paymentMethod.card.brand + " " + paymentMethod.card.last4 : paymentMethod.type,
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
  const { payment_method } = details;
  let permitQuery = undefined
  let inputData = undefined
  if (addPermitDetails.permitType === "zone") {
    permitQuery = `
          mutation PurchasePermit($input: PurchaseZoneInput!) {
            purchaseZonePermit(input: $input) {
              type,
              area,
              purchaseDate,
              activeDate,
              expireDate,
              receipt {
                service,
                subTotal,
                total
              }
              paymentMethod
            }
          }`

    inputData = {
      vehicle: JSON.parse(addPermitDetails.vehicle as unknown as string)?.plate,
      zone: addPermitDetails.zone,
      duration: addPermitDetails.duration,
      paymentMethod: payment_method
    }

  }

  if (addPermitDetails.permitType === "lot") {
    const vehicleRes = await fetch("http://localhost:4001/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        query: `query defaultVehicle {
                      getDefaultVehicle {
                        id,
                        plate
                      }
                  }`
      })
    })

    const vehicle = await vehicleRes.json();
    if (await vehicle.errors !== undefined) {
      throw new Error(`Failed to fetch default Vehicle: ${vehicle.errors[0]}`);
    }

    permitQuery = `mutation PurchasePermit($input: PurchaseLotInput!) {
                    purchaseLotPermit(input: $input) {
                      type,
                      area,
                      purchaseDate,
                      activeDate,
                      expireDate,
                      receipt {
                        service,
                        subTotal,
                        total
                      }
                      paymentMethod
                    }
                  }`
    inputData = {
      vehicle: vehicle.data.getDefaultVehicle.plate,
      lot: addPermitDetails.lot,
      duration: addPermitDetails.duration,
      paymentMethod: payment_method
    }
  }

  if (permitQuery) {
  const res = await fetch("http://localhost:4003/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAuthToken()}`,
    },
    body: JSON.stringify({
      query: permitQuery,
      variables: {
        input: inputData
      }
    }),
  });

  const result = await res.json();
  

  if (await result.errors !== undefined) {
    throw new Error("Failed to save permit details");
  }
  } else {
    throw new Error("Permit Type not resolved");
  }
}

export async function addTicketDetails(
  TicketDetails: {
    type: string;
    ticketId: string;
    ticketFine: number;
  },
) {
  if (TicketDetails.type !== "ticket") {
    throw new Error("Invalid ticket type");
  }
  try {
    const { ticketId } = TicketDetails;
    const res = await fetch("http://localhost:4002/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        query: `mutation AddTicket($input: PaidTicketInput!) {
        markTicketAsPaid(input: $input) {
          id
          vehicle
          fine
          }
        }`,
          variables: {
            input: {
              id: ticketId
            }
          }
      }),
    });
    
    const result = await res.json();

    if (res.status !== 201 && res.status !== 200 && res.status !== 204) {
      throw new Error("Failed to save ticket details");
    } 
    if (result.errors) {
      throw new Error(`Failed to save ticket details: ${result.errors[0].message}`);
    }
  } catch (error) {
    console.error("Error adding ticket details:", error);
    throw new Error("Failed to save ticket details");
  }
}