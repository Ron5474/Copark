import {
  Route,
  Controller,
  Post,
  Body,
  Get,
} from "tsoa";
import { Credentials, Authenticated } from "./index";
import { AuthService } from "./service";

@Route("auth")
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  @Post("login")
  public async login(@Body() credentials: Credentials): Promise<Authenticated | undefined> {
    return this.authService.authenticate(credentials);
  }

  @Get("status")
  public async status(): Promise<string> {
    return "Auth service is running!";
  }
}