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
    @Body() item: string
  ): Promise<void> {
    const session = await new PaymentService().payment(item, request.user?.id);
    if (!session) {
      this.setStatus(500);
      throw new Error("Failed to create payment session");
    }
    try {
      this.setStatus(302); // Set the status code to 302 for redirection
    this.setHeader('Location', session); // This will perform a redirect
    return;
    } catch{
      this.setStatus(400);
      throw new Error("Bad Request");
    }
  }
}

