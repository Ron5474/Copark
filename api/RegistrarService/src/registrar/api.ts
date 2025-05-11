import {
  Route,
  Controller,
  Get,
  Security,
  Request,
  Query,
} from "tsoa";
import { RegistrarService } from "./service";

@Route("registrar")
export class RegistrarController extends Controller {
  private registrarService: RegistrarService = new RegistrarService();

  /**
   * Check if a user has any outstanding tickets
   * @param email Email address of the user to check
   * @param request Express request object containing admin token
   * @returns true if user has outstanding tickets, false otherwise
   */
  @Get("check-tickets")
  @Security("jwt", ["admin"]) // Changed to admin since they'll be checking other users
  public async checkOutstandingTickets(
    @Query() email: string,
    @Request() request: Express.Request
  ): Promise<boolean> {
    return this.registrarService.hasOutstandingTickets(email);
  }
}