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
    @Body() item: Checkout
  ): Promise<{url: string}> {
    const session = await new PaymentService().payment(item.item, request.user?.id);
    if (!session) {
      this.setStatus(500);
      throw new Error("Failed to create payment session");
    }
    // try {
    console.log("session", session);
    this.setStatus(302); // Set the status code to 302 for redirection
    return { url: session }; // Return the URL for redirection
    // } catch (err) {
    //   console.log(request.user?.id);
    //   console.log(err);
    //   this.setStatus(400);
    //   throw new Error("Bad Request");
    // }
  }
}

