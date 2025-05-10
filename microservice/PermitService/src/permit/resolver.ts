import { Resolver, Query,  Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import { Receipt, PurchaseZoneInput, IsValidInput, IsValid, IsValidPermitInput } from './schema'
import { PermitService } from './service'

const service = new PermitService()

@Resolver()
export class PermitResolver {

  @Query(() => String)
  permitServiceStatus(): string {
    return "Permit service is running"
  }
  
  @Authorized('driver')
  @Mutation(() => Receipt)
  async purchaseZonePermit(
    @Arg("input", () => PurchaseZoneInput) input: PurchaseZoneInput,
    @Ctx() request: Request
  ): Promise<Receipt> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    return await service.purchaseMyZonePermit(input)
  }

  @Authorized('enforcement')
  @Mutation(() => IsValid)
  async isValidPermit(
    @Arg("input", () => IsValidInput) input: IsValidInput,
    @Ctx() request: Request
  ): Promise<IsValid> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    return await service.isValidPermit(input)
  }

  @Authorized('enforcement')
  @Query(() => IsValid)
  async isValidZonePermit(
    @Arg("input", () => IsValidPermitInput) input: IsValidPermitInput,
    @Ctx() request: Request
  ): Promise<IsValid> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    
    let vehicleId = input.vehicle

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
        variables: { plate: vehicleId },
      }),
    })

    const vehicleJson = await vehicleRes.json()
    const found = vehicleJson?.data?.findVehicleByPlate?.id

    if (!found) {
      return {isValid: false, type: 'Vehicle Not Found', zone: input.zone}
    }

    vehicleId = found


    return await service.isValidZonePermit({vehicle: vehicleId, zone: input.zone})
  }
}
