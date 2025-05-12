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

  @Get("vehicles")
  @Security("jwt")
  public async getAllVehicles(): Promise<{id: string, plate: string, country: string, state: string, nickname: string}[]> {
    return this.registrarService.getAllVehicles();
  }

  @Get("tickets")
  @Security("jwt")
  public async getAllTickets(): Promise<{
    id: string,
    vehicle: string,
    enforcer: string,
    issuedDate: Date,
    violation: string,
    fine: number,
    ticketStatus: string,
    images?: string
  }[]> {
    return this.registrarService.getAllTickets();
  }
}