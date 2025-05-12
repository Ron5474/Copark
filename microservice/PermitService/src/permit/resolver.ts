import { Resolver, Query,  Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import {
  Confirmation,
  PurchaseZoneInput,
  IsValid,
  IsValidPermitInput,
  IsValidPolice,
  MyPermits,
  // ZoneDetails,
} from './schema'
import { PermitService } from './service'

const service = new PermitService()

@Resolver()
export class PermitResolver {

  @Query(() => String)
  permitServiceStatus(): string {
    return "Permit service is running"
  }
  
  @Authorized('driver')
  @Mutation(() => Confirmation)
  async purchaseZonePermit(
    @Arg("input", () => PurchaseZoneInput) input: PurchaseZoneInput,
    @Ctx() request: Request
  ): Promise<Confirmation> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    return await service.purchaseMyZonePermit(input)
  }

  // @Authorized('enforcement')
  // @Mutation(() => IsValid)
  // async isValidPermit(
  //   @Arg("input", () => IsValidInput) input: IsValidInput,
  //   @Ctx() request: Request
  // ): Promise<IsValid> {
  //   const userId = request.user?.id
  //   if (!userId) throw new Error('Unauthorized')
  //   return await service.isValidPermit(input)
  // }

  @Authorized('enforcement')
  @Query(() => IsValid)
  async isValidZonePermit(
    @Arg("input", () => IsValidPermitInput) input: IsValidPermitInput,
    @Ctx() request: Request
  ): Promise<IsValid> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    
    const plate = input.vehicle

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
        variables: { plate },
      }),
    })

    const vehicleJson = await vehicleRes.json()
    const vehicleId = vehicleJson?.data?.findVehicleByPlate?.id

    if (vehicleId) {
      return {isValid: false, type: 'Vehicle Not Found', zone: input.zone}
    }

    return await service.isValidZonePermit({vehicle: vehicleId, zone: input.zone})
  }

  @Authorized('police')
  @Query(() => IsValidPolice)
  async isValidPermitByPolice (
    @Arg("plate", () => String) plate: string,
    @Ctx() request: Request
  ): Promise<IsValidPolice> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')

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
        variables: { plate },
      }),
    })

    const vehicleJson = await vehicleRes.json()
    const vehicleId = vehicleJson?.data?.findVehicleByPlate?.id

    if (!vehicleId) {
      return {isValid: false}
    }

    return await service.isValidPermitPolice(vehicleId)
  }

  @Authorized('driver')
  @Query(() => MyPermits)
  async myPermits(
    @Arg("vehicleID", () => String) vehicleID: string,
    @Ctx() request: Request
  ): Promise<MyPermits> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    
    // const vehicleQuery = `
    //   query {
    //     myVehicles {
    //       id
    //       plate
    //       country
    //       state
    //     }
    //   }
    // `

    // const vehicleRes = await fetch('http://localhost:4001/graphql', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `${request.headers.authorization}`,
    //   },
    //   body: JSON.stringify({
    //     query: vehicleQuery,
    //   }),
    // })

    // const vehicleJson = await vehicleRes.json()
    // const vids = vehicleJson?.data?.myVehicles?.id

    // if (vids.length == 0) {
    //   return []
    // }

    return await service.getMyPermits(vehicleID)
  }

  // @Authorized('driver')
  // @Query(() => ZoneDetails)
  // async zoneDetails(
  //   @Arg("zone", () => String) zone: string,
  //   @Ctx() request: Request
  // ): Promise<ZoneDetails> {
  //   const userId = request.user?.id
  //   if (!userId) throw new Error('Unauthorized')

  //   return await service.getZoneDetails(zone)
  // }
}
