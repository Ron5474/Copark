import {
  Route,
  Controller,
  Post,
  Body,
  Get
} from "tsoa";
import { Credentials, Authenticated } from "./";
import { AuthService } from "./service";

@Route("auth")
export class AuthController extends Controller {

  @Post("login")
  public async login(@Body() credentials: Credentials): Promise<Authenticated | undefined> {
    return new AuthService().authenticate(credentials);
  }

  @Get("status")
  public async status(): Promise<string> {
    return "Auth service is running!";
  }
}