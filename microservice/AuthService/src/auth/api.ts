import {
  Route,
  Controller,
  Post,
  Body,
  Get,
  Security,
  Request,
  Response,
  Query,
  Put
} from "tsoa";
import * as express from "express";
import { Credentials, Authenticated, OauthLoginData, AuthUser, OauthSignup } from "./index";
import { AuthService } from "./service";
import { SessionUser, User } from "./index";

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

  @Post("driver/signup")
  public async driverSignup(@Body() token: OauthSignup): Promise<string | undefined> {
    const oauthUserData = await new AuthService().decryptOauth(token.authToken);
    if (!oauthUserData) {
      this.setStatus(400)
      return undefined
    } else {
      const res = await new AuthService().driverSignup(oauthUserData)
      if (!res) {
        this.setStatus(204)
        return undefined
      } else {
        this.setStatus(201)
        return res
      }
    }
  }

  @Put("driver/onboarding")
  @Security("jwt", ["driver"])
  public async setOnBoardingState(@Request() request: express.Request, @Body() state: {newState: string}): Promise<void> {
    return new AuthService().setOnBoardingState(request.user?.id, state.newState);
  }

  @Get("driver/login")
  @Security("jwt", ["driver"])
  public async driverLogin(@Request() request: express.Request): Promise<string | undefined> {
    if (!request.user) {
      this.setStatus(404)
      return undefined
    }
    const user =  await new AuthService().activeDriver(request.user?.id);
    if (!user) {
      this.setStatus(404)
      return undefined
    }
    return user
  }

  @Get("driver/id")
  @Security("jwt", ["driver"])
  public async getDriverId(@Request() request: express.Request): Promise<User | undefined> {
    return new AuthService().getOauthUser(request.user);
  }

  @Post("driver/email")
  @Security("jwt", ["admin", "enforcement"])
  public async getDriverByID(@Body() UserID: {id: string}): Promise<AuthUser | undefined> {
    return new AuthService().getDriverByID(UserID.id);
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
  // @Security("jwt", ["payroll", "registrar"])
  public async getIDByEmail(@Query() email: string): Promise<{id: string | null}> {
    const id = await new AuthService().getIDByEmail(email);
    return {id: id ?? null};
  }

}