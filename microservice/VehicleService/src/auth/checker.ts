import { AuthChecker } from 'type-graphql'
import { Request } from 'express'
import { AuthService } from './service'

export const expressAuthChecker: AuthChecker<Request> = async ({ context }) => {
  try {
    context.user = await new AuthService().check(context.headers.authorization)
    return true
  } catch {
    return false
  }
}
