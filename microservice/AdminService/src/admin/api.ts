import {
  Route,
  Controller,
  Post,
  Body,
  Get
} from "tsoa";
import { EnforcementUser, NewEnforcementUser } from ".";
import { AdminService } from "./service";

@Route("admin")
export class AdminController extends Controller {

  @Get("getEnforcers")
  public async getEnforcers(): Promise<EnforcementUser[]> {
    return new AdminService().getEnforcers();
  }

  @Post("addEnforcer")
  public async addEnforcer(@Body() enforcer: NewEnforcementUser): Promise<EnforcementUser[]> {
    return new AdminService().addEnforcer(enforcer);
  }
}