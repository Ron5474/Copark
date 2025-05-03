/**
 * @file expressAuth.ts
 * @description This file contains the Express authentication middleware.
 */

import {Request} from "express"
import {AuthService} from './service'
import {SessionUser} from '../index'

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<SessionUser> {
  // console.log(request.headers.authorization); 
  // console.log(scopes);
  return new AuthService().check(request.headers.authorization, scopes)
}