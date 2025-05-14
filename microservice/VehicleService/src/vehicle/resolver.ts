import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import { Vehicle, RegisterVehicleInput, UpdateVehicleInput, VehicleID, createdVehicleInput, CreatedVehicle } from './schema'
import { VehicleService } from './service'
import { SessionUser } from '../types/express'


const service = new VehicleService()

@Resolver()
export class VehicleResolver {
  // need to allow admin and enforcement to see all vehicles so they can get tickets for those vehicles
  // temporaryly disabled security, but really there should be another function for enforcement and admins to
  // get vehicles of a userID
  // @Authorized('admin', 'enforcement', 'police')
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

  // need to add code for security in getTicketsForVehicleID
  // @Authorized('admin', 'enforcement')
  @Query(() => [VehicleID], { nullable: true })
  async getVehicleByUserId(
    @Arg('userID', () => String) userID: string
  ): Promise<VehicleID[] | null> {
    return await service.getVehicleByUserId(userID);
  }

  @Authorized('admin', 'enforcement')
  @Mutation(() => CreatedVehicle)
  async createUnregisteredVehicle(
    @Arg('input', () => createdVehicleInput) input: createdVehicleInput
  ): Promise<CreatedVehicle> {
    return await service.createUnregisteredVehicle(input);
  }

  @Authorized('enforcement')
  @Mutation(() => CreatedVehicle)
  async findOrCreateVehicleByPlate(
    @Arg('plate', () => String) plate: string
  ): Promise<CreatedVehicle> {
    console.log("before find")
    const vehicle = await service.findVehicleByPlate(plate)
    console.log("vehicle called")
    if (vehicle) {
      return {
        id: vehicle.id,
        plate: vehicle.plate,
        country: vehicle.country ?? null,
        state: vehicle.state ?? null,
      }
    }

    return await service.createUnregisteredVehicle({ plate })
  }
}
