import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import { Vehicle, RegisterVehicleInput, UpdateVehicleInput } from './schema'
import { VehicleService } from './service'
import { SessionUser } from '../types/express'


const service = new VehicleService()

@Resolver()
export class VehicleResolver {
  @Authorized('driver')
  @Query(() => [Vehicle])
  async myVehicles(@Ctx() request: Request & {user: SessionUser}): Promise<Vehicle[]> {
    const userId = request.user.id
    return await service.getMyVehicles(userId)
  }

  @Authorized('driver')
  @Mutation(() => Vehicle)
  async registerVehicle(
    @Arg('input', () => RegisterVehicleInput) input: RegisterVehicleInput,
    @Ctx() request: Request & {user: SessionUser}
  ): Promise<Vehicle> {
    const userId = request.user.id
    return await service.registerVehicle(userId, input)
  }

  @Authorized('driver')
  @Mutation(() => Vehicle)
  async updateVehicle(
    @Arg('input', () => UpdateVehicleInput) input: UpdateVehicleInput,
    @Ctx() request: Request & {user: SessionUser}
  ): Promise<Vehicle> {
    const userId = request.user.id
    return await service.updateVehicle(userId, input)
  }

  @Authorized('admin', 'enforcement', 'police')
  @Query(() => Vehicle, { nullable: true })
  async findVehicleByPlate(
    @Arg('plate', () => String) plate: string
  ): Promise<Vehicle | null> {
    return await service.findVehicleByPlate(plate)
  }

  @Authorized('admin', 'enforcement')
  @Query(() => Vehicle, { nullable: true })
  async checkForVehicleID(
    @Arg('vehicleID', () => String) vehicleID: string
  ): Promise<Vehicle | null> {
    return await service.getVehicleById({ id: vehicleID })
  }
}
