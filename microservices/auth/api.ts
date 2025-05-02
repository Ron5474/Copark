import {
  Route,
  Controller,
  Get,
} from "tsoa";

@Route('')
export class ApiTest extends Controller {
  @Get()
  public async test(): Promise<string> {
    return "Hello World!";
  }
}