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
  @Get('check/plate')
  @Security('jwt', ['police'])
  public async checkPermitByPlate(
    @Query() plate: string,
    @Request() request: express.Request & {user: SessionUser}
  ): Promise<boolean> {
    // const currentUser = request.user.id
    // console.log('Current User: ', currentUser)

    const vehicleQuery = `
      query FindVehicleByPlate($plate: String!) {
        findVehicleByPlate(plate: $plate) {
          id
        }
      }
    `
    const vehicleRes = await fetch('http://localhost:4001/graphql', {
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

    const vehicleJson = await vehicleRes.json()
    const found = vehicleJson?.data?.findVehicleByPlate?.id

    console.log(found)
    return true
  }
}