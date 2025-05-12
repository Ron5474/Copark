import * as express from 'express'
import { 
  Controller, 
  // Path, 
  // Response, 
  Query,
  Route, 
  Security, 
  Request,
  Get } from 'tsoa'

import { SessionUser } from '../'



@Route('registrar')
export class registrarController extends Controller {
  @Get('check')
  @Security('jwt', ['registrar'])
  public async checkTicketByEmail(
    @Query() email: string,
    @Request() request: express.Request & {user: SessionUser}
  ): Promise<boolean> {

    const hasPendingTicketQuery = `
      query HasPendingTicket($email: EmailInput!) {
        hasPendingTicket(email: $email) {
          hasTicket
        }
      }
    `
    const hasTicketRes = await fetch('http://localhost:4002/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${request.headers.authorization}`,
      },
      body: JSON.stringify({
        query: hasPendingTicketQuery,
        variables: { email: email },
      }),
    })
    const result = await hasTicketRes.json()
    const found = result?.data?.hasPendingTicket?.hasTicket
    return found
  }
}