import {
  Route,
  Controller,
  Post,
  Body,
  Security,
  Request,
  Response,
} from "tsoa";
import * as express from "express";
import { Checkout, PaymentDetails } from "./index";
import { PaymentService } from "./service";

@Route("payment")
export class PaymentController extends Controller {
  private async getUserData(token?: string): Promise<{ id: string, name: string, role: string[] }> {
    if (!token) {
      throw new Error('Token not provided');
    }

    const response = await fetch('http://localhost:3010/api/v0/auth/driver/id', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    const res = response.status === 200 ? await response.json() : null;
    return {
      id: res.id,
      name: res.name,
      role: res.role
    };
  }

  @Post('/pay')
  @Security("jwt", ["driver"])
  @Response('500', 'Failed to create payment session')
  @Response('302', 'Redirecting to payment session')
  @Response('401', 'Unauthorized')
  @Response('400', 'Bad Request')
  public async createPayment(
    @Request() request: express.Request,
    @Body() checkoutProps: Checkout
  ): Promise<{url: string}> {
    const session = await new PaymentService().payment(checkoutProps, request.user?.id);
    if (!session) {
      this.setStatus(500);
      throw new Error("Failed to create payment session");
    }
    
    // console.log("session", session);
    this.setStatus(302);
    return { url: session };
  }

  @Post('/complete')
  @Security("jwt", ["driver"])
  @Response('201', 'Payment details saved')
  public async completePayment(
    @Request() request: express.Request,
    @Body() paymentDetails: PaymentDetails
  ): Promise<void> {
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id

    const res = await new PaymentService().completePayment(paymentDetails, userId);
    if (!res) {
      this.setStatus(200);
      return;
    }
    this.setStatus(201);
    return;
  }
}
