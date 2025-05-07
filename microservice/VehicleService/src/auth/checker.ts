import { AuthChecker } from 'type-graphql'
import { Request } from 'express'
import { AuthService } from './service'

export const expressAuthChecker: AuthChecker<Request> = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { root, args, context, info }, roles,) => 
{
  try {
    context.user = await new AuthService().check(context.headers.authorization, roles)
  } catch {
    return false
  }
  return true
}
