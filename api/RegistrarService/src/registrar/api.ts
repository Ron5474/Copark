import {
  Route,
  Controller,
  Post,
  Body,
  Get,
  Security,
  Request,
  Response
} from "tsoa";
import * as express from "express";
import { Credentials, Authenticated, OauthLoginData } from "./";
import { RegistrarService } from "./service";
import { SessionUser } from "./index";

@Route("registrar")
export class RegistrarController extends Controller {
}