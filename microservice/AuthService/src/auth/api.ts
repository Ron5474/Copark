import {
  Route,
  Controller,
  Post,
  Body,
  Get,
  Security,
  Request
} from "tsoa";
import * as express from "express";
import { Credentials, Authenticated, OauthLoginData } from "./";
import { AuthService } from "./service";
import { SessionUser } from "./index";

@Route("auth")
export class AuthController extends Controller {

  @Post("login")
  public async login(@Body() credentials: Credentials): Promise<Authenticated | undefined> {
    // console.log("authenticating user with credentials:", credentials);
    return new AuthService().authenticate(credentials);
  }

  @Post("driver/login")
  @Security("jwt", ["driver"])
  public async driverLogin(@Request() request: express.Request): Promise<string | undefined> {
    
    return new AuthService().driverLogin(request.user)
  }

  @Get("status")
  public async status(): Promise<string> {
    return "Auth service is running!";
  }

  @Get("driver/id")
  @Security("jwt", ["driver"])
  public async getDriverId(@Request() request: express.Request): Promise<string | undefined> {
    // console.log("authenticating user with credentials:", credentials);
    return new AuthService().getOauthUser(request.user);
  }

  @Post("check")
  @Security("jwt", undefined)
  public async check(@Request() request: express.Request,
    @Body() roles: string[]
  ): Promise<SessionUser | OauthLoginData | undefined> {
    // console.log('eowefjioefjiowfejiowejiowefjioefwjioefjioef')
    console.log(request.headers.authorization, roles)
    return new AuthService().check(request.headers.authorization, roles);
  }
}