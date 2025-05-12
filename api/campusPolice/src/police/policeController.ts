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



@Route('police')
export class PoliceController extends Controller {
  @Get('check')
  @Security('jwt', ['police'])
  public async checkPermitByPlate(
    @Query() plate: string,
    @Request() request: express.Request & {user: SessionUser}
  ): Promise<boolean> {

    const vehicleQuery = `
      query IsValidPermitByPolice($plate: String!) {
        isValidPermitByPolice(input: $plate) {
          isValid
        }
      }
    `
    const validPermitRes = await fetch('http://localhost:4003/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${request.headers.authorization}`,
      },
      body: JSON.stringify({
        query: vehicleQuery,
        variables: { plate: plate },
      }),
    })
    const validPermit = await validPermitRes.json()
    const found = validPermit?.data?.isValidPermitByPolice?.isValid
    return found
  }
}