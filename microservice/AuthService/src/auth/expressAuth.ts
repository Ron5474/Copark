/**
 * @file expressAuth.ts
 * @description This file contains the Express authentication middleware.
 */

import {Request} from "express"
import {AuthService} from './service'
import {SessionUser} from '../index'
import { OauthUser } from "."

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<SessionUser|OauthUser> {
  // console.log("reqheader auth:" + request.headers.authorization); 
  // console.log("scopes:" + scopes);
  return new AuthService().check(request.headers.authorization, scopes)
}