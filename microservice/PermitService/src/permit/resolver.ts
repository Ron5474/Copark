import { Resolver, Query, /*Mutation, Arg,*/ Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import { Permit/*, RegisterVehicleInput, UpdateVehicleInput*/ } from './schema'
import { PermitService } from './service'

const service = new PermitService()

@Resolver()
export class PermitResolver {
  @Authorized('driver')
  @Query(() => [Permit])
  async myPermits(@Ctx() request: Request): Promise<Permit[]> {
    const userId = request.user?.id
    if (!userId) throw new Error('Unauthorized')
    return await service.getMyPermits(userId)
  }
}
