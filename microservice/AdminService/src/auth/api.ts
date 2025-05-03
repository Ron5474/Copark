import {
  Route,
  Controller,
  Post,
  Body,
  Get
} from "tsoa";
import { EnforcementUser } from "./";
import { AdminService } from "./service";

@Route("admin")
export class AdminController extends Controller {

  @Post("getEnforcers")
  public async getEnforcers(): Promise<EnforcementUser[]> {
    return new AdminService().getEnforcers();
  }
}