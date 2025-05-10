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
    @Arg("input") input: PurchaseZoneInput,
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
  @Mutation(() => IsValid)
  async isValidZonePermit(
    @Arg("input", ) input: IsValidPermitInput,
    @Ctx() request: Request
  ): Promise<IsValid> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    return await service.isValidZonePermit(input)
  }
}
