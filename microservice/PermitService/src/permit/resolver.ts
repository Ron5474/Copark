import { Resolver, Query,  Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import {
  Confirmation,
  PurchaseZoneInput,
  IsValid,
  IsValidPermitInput,
  IsValidPolice,
  MyPermits,
  ZoneDetails,
} from './schema'
import { PermitService } from './service'
import { sendPermitEmail } from './emailClient'

const service = new PermitService()

@Resolver()
export class PermitResolver {

  private async getUserData(token?: string): Promise<{ id: string, name: string, role: string[], email: string }> {
    if (!token) {
      throw new Error('Token not provided');
    }
    const response = await fetch('http://localhost:3010/api/v0/auth/driver/id', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    const res = response.status === 200 ? await response.json() : null;
    if (!res) {
      throw new Error('User not found');
    }
    return {
      id: res.id,
      name: res.name,
      role: res.role,
      email:res.email
    };
  }

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
    console.log('input', input)
    // const userId = request.user?.id
    // if (!userId) throw new Error('Unauthorized')

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
    // console.log('vehicleJson', vehicleJson)

    const vehicleId = vehicleJson?.data?.findVehicleByPlate?.id

    if (!vehicleId) {
      throw new Error('Vehicle not found')
    }
    
    const purchaseMyZonePermit = await service.purchaseMyZonePermit({
      vehicle: vehicleId,
      zone: input.zone,
      duration: input.duration,
      paymentMethod: input.paymentMethod
    })

    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = await this.getUserData(token);

    // Step 2: Send email
    await sendPermitEmail({
      to: user.email,
      subject: 'Your CoPark Permit Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="text-align: center;">
            <h2 style="color: #2c3e50;">Permit Purchase Confirmation</h2>
          </div>
          <p style="font-size: 16px; color: #34495e;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #34495e;">
            We're happy to let you know that your permit purchase was successful!
          </p>

          <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Zone:</strong> ${input.zone}</p>
            <p><strong>Duration:</strong> ${input.duration}</p>
            <p><strong>Vehicle Plate:</strong> ${plate}</p>
            <p><strong>Payment Method:</strong> ${input.paymentMethod}</p>
          </div>

          <p style="font-size: 15px; color: #7f8c8d;">
            If you have any questions, feel free to contact our support team.
          </p>

          <p style="font-size: 15px; color: #7f8c8d;">
            Thanks for using <strong>CoPark</strong>
          </p>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="text-align: center; font-size: 12px; color: #95a5a6;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `,
    });

    return purchaseMyZonePermit
  }

  @Authorized('enforcement')
  @Query(() => IsValid)
  async isValidZonePermit(
    @Arg("input", () => IsValidPermitInput) input: IsValidPermitInput,
    @Ctx() request: Request
  ): Promise<IsValid> {
    // const userId = request.user?.id
    // if (!userId) throw new Error('Unauthorized')
    
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
    // console.log('vehicleJson', vehicleJson)

    const vehicleId = vehicleJson?.data?.findVehicleByPlate?.id

    if (!vehicleId) {
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
    // console.log('HELOOOOOOOOOO')
    // const userId = request.user?.id
    // if (!userId) throw new Error('Unauthorized')
    // console.log('HELOOOOOOOOOO 2')
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
    // @Ctx() request: Request
  ): Promise<MyPermits> {
    // const userId = request.user?.id
    // if (!userId) throw new Error('Unauthorized')

    return await service.getMyPermits(vehicleID)
  }

  @Authorized('driver')
  @Query(() => ZoneDetails)
  async zoneDetails(
    @Arg("zone", () => String) zone: string,
    // @Ctx() request: Request
  ): Promise<ZoneDetails> {
    // const userId = request.user?.id
    // if (!userId) throw new Error('Unauthorized')

    return await service.getZoneDetails(zone)
  }
}
