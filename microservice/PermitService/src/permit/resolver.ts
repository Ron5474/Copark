import { Resolver, /*Query,*/ Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import { Receipt, PurchaseZonePermitInput } from './schema'
import { PermitService } from './service'

const service = new PermitService()

@Resolver()
export class PermitResolver {
  
  @Authorized('driver')
  @Mutation(() => Receipt)
  async purchaseZonePermit(
    @Arg("input") input: PurchaseZonePermitInput,
    @Ctx() request: Request
  ): Promise<Receipt> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    return await service.purchaseMyZonePermit(input)
  }
}
