import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import { Vehicle, RegisterVehicleInput, UpdateVehicleInput, VehicleID, createdVehicleInput, CreatedVehicle, OwnerID, DefaultVehicleDetails, setDefaultVehicleInput } from './schema'
import { VehicleService } from './service'
import { SessionUser } from '../types/express'


const service = new VehicleService()

@Resolver()
export class VehicleResolver {
  private async getUserData(token?: string): Promise<{ id: string, name: string, role: string[] }> {
    // if (!token) {
    //   throw new Error('Token not provided');
    // }
    const response = await fetch('http://localhost:3010/api/v0/auth/driver/id', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    const res = response.status === 200 ? await response.json() : null;
    // if (!res) {
    //   throw new Error('User not found');
    // }
    return {
      id: res.id,
      name: res.name,
      role: res.role
    };
  }
  // need to allow admin and enforcement to see all vehicles so they can get tickets for those vehicles
  // temporaryly disabled security, but really there should be another function for enforcement and admins to
  // get vehicles of a userID
  // @Authorized('admin', 'enforcement', 'police')
  @Authorized('driver')
  @Query(() => [Vehicle])
  async myVehicles(@Ctx() request: Request & {user: SessionUser}): Promise<Vehicle[]> {
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id
    return await service.getMyVehicles(userId)
  }

  @Authorized('driver')
  @Query(() => DefaultVehicleDetails)
  public async getDefaultVehicle(
    @Ctx() request: Request & {user: SessionUser}
  ): Promise<DefaultVehicleDetails> {
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id
    const defaultVehicle = await service.getDefaultVehicle(userId) 
    if (!defaultVehicle) {
      throw new Error('No default vehicle found')
    }
    return {
      id: defaultVehicle.id,
      plate: defaultVehicle.plate,
    }
  }

  @Authorized('driver')
  @Mutation(() => Vehicle)
  async registerVehicle(
    @Arg('input', () => RegisterVehicleInput) input: RegisterVehicleInput,
    @Ctx() request: Request & {user: SessionUser}
  ): Promise<Vehicle> {
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id  
    return await service.registerVehicle(input, userId)
  }

  @Authorized('driver')
  @Mutation(() => Vehicle)
  async updateVehicle(
    @Arg('input', () => UpdateVehicleInput) input: UpdateVehicleInput,
    @Ctx() request: Request & {user: SessionUser}
  ): Promise<Vehicle> {
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id  
    return await service.updateVehicle(input, userId)
  }

  @Authorized('driver')
  @Mutation(() => VehicleID)
  async setDefaultVehicle(
    @Arg('input', () => setDefaultVehicleInput) vehicleID: setDefaultVehicleInput,
    @Ctx() request: Request & {user: SessionUser}
  ): Promise<VehicleID> {
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id  
    return await service.setDefaultVehicle(vehicleID, userId)
  }

  @Authorized('admin', 'enforcement')
  @Query(() => OwnerID, { nullable: true })
  async findOwnerByVehicleID(
     @Arg('vehicle', () => String) vehicle: string
  ): Promise<OwnerID | null> {
    return await service.findOwnerByVehicleID(vehicle)
  }

  @Authorized('admin', 'enforcement', 'police', 'driver')
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
  ): Promise<VehicleID[]> {
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
    const vehicle = await service.findVehicleByPlate(plate)
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
