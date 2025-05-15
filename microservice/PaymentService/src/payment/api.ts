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
import { Checkout } from "./index";
import { PaymentService } from "./service";

@Route("pay")
export class PaymentController extends Controller {
  @Post('/')
  @Security("jwt", ["driver"])
  @Response('500', 'Failed to create payment session')
  @Response('302', 'Redirecting to payment session')
  @Response('401', 'Unauthorized')
  @Response('400', 'Bad Request')
  public async createPayment(
    @Request() request: express.Request,
    @Body() checkoutProps: Checkout
  ): Promise<{url: string}> {
    const session = await new PaymentService().payment(checkoutProps.item, checkoutProps.locale, request.user?.id);
    if (!session) {
      this.setStatus(500);
      throw new Error("Failed to create payment session");
    }
    
    // console.log("session", session);
    this.setStatus(302);
    return { url: session };
  }
}

