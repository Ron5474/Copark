import {
  Route,
  Controller,
  Post,
  Body,
  Get,
  Security,
  Request,
  Response,
  Query
} from "tsoa";
import * as express from "express";
import { Credentials, Authenticated, OauthLoginData } from "./";
import { AuthService } from "./service";
import { SessionUser } from "./index";

@Route("auth")
export class AuthController extends Controller {

  @Post("login")
  @Response('404', 'Not Found')
  public async login(@Body() credentials: Credentials): Promise<Authenticated | undefined> {
    // console.log("authenticating user with credentials:", credentials);
    return new AuthService().authenticate(credentials)
      .then(async (user: Authenticated|undefined): Promise<Authenticated|undefined> => {
        if (!user) {
          this.setStatus(404)
        }
        return user
      })
  }

  @Post("driver/login")
  @Security("jwt", ["driver"])
  public async driverSignup(@Request() request: express.Request): Promise<string | undefined> {
    return new AuthService().driverSignup(request.user)
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
    // console.log("ROLE!S :" + request.headers.authorization, roles)
    return new AuthService().check(request.headers.authorization, roles);
  }

  @Get("id")
  public async getIDByEmail(@Query() email: string): Promise<string | undefined> {
    const id = await new AuthService().getIDByEmail(email);
    console.log("Resolved ID:", id); // debug log
    return id;
  }

}