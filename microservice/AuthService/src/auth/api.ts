import {
  Route,
  Controller,
  Post,
  Body,
  Get,
  Header
} from "tsoa";
import { Credentials, Authenticated } from "./";
import { AuthService } from "./service";
import { SessionUser } from "./index";

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

  @Post("check")
  public async check(
    @Header("Authorization") authHeader: string,
    @Body() roles: string[]
  ): Promise<SessionUser | undefined> {
    // console.log('eowefjioefjiowfejiowejiowefjioefwjioefjioef')
    return new AuthService().check(authHeader, roles);
  }
}