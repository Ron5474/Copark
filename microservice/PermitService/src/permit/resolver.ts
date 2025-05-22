import { Resolver, Query,  Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { Request } from 'express'
import {
  Confirmation,
  PurchaseZoneInput,
  IsValid,
  IsValidPermitInput,
  IsValidPolice,
  MyPermits,
  NewZone,
  ZoneDetails,
  PermitsByDay,
  LotDetails,
  PurchaseLotInput,
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
    let durationString = "";
    if (input.duration?.hours && input.duration?.minutes) {
      if (input.duration.hours > 1) {
      durationString += `${input.duration.hours} hours`
      } else {
        durationString += `${input.duration.hours} hour`
      }
      if (input.duration.minutes > 1) {
        durationString += ` ${input.duration.minutes} minutes`
      } else {
        durationString += ` ${input.duration.minutes} minute`
      }
    } else if (input.duration?.hours) {
      if (input.duration.hours > 1) {
        durationString = `${input.duration.hours} hours`
      } else {
        durationString = `${input.duration.hours} hour`
      }
    } else if (input.duration?.minutes) {
      durationString = `${input.duration.minutes} minutes`
    }

    let brand;
    switch (input.paymentMethod.split(" ")[0]) {
      case 'visa':
        brand = 'https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png'
        break
      case 'mastercard':
        brand = 'https://www.mastercard.com/content/dam/public/brandcenter/assets/images/logos/mclogo-for-footer.svg'
        break
      case 'amex':
        brand = 'https://www.aexp-static.com/cdaas/one/statics/axp-static-assets/1.8.0/package/dist/img/logos/dls-logo-bluebox-solid.svg'
        break
      case 'discover':
        brand = 'https://www.discover.com/content/dam/discover/en_us/credit-cards/card-acquisitions/grey-redesign/global/images/icons/icon-discover-logo-136-23.png'
        break
      default:
        brand = input.paymentMethod.split(" ")[0] ? input.paymentMethod.split(" ")[0] : input.paymentMethod
        break
    }
    const b = input.paymentMethod.split(" ")[0] ? input.paymentMethod.split(" ")[0] : undefined
    const showLogo = b && (b === 'visa' || b === 'mastercard' || b === 'amex' || b === 'discover')

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
            <p><strong>Duration:</strong> ${durationString}</p>
            <p><strong>Vehicle Plate:</strong> ${plate}</p>
            <p><strong>Payment Method: ${!showLogo ? brand: `<img src=${brand} alt="${b}" style="height: 1em; vertical-align: middle;" /> ${input.paymentMethod.split(" ")[1]}`}</strong></p>
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

    if (!vehicleId) {
      return {isValid: false, type: 'Vehicle Not Found', area: input.zone}
    }

    return await service.isValidZonePermit({vehicle: vehicleId, zone: input.zone})
  }

  @Authorized('police')
  @Query(() => IsValidPolice)
  async isValidPermitByPolice (
    @Arg("plate", () => String) plate: string,
    @Ctx() request: Request
  ): Promise<IsValidPolice> {
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
  ): Promise<MyPermits> {

    return await service.getMyPermits(vehicleID)
  }

  @Authorized('driver')
  @Query(() => ZoneDetails)
  async zoneDetails(
    @Arg("zone", () => String) zone: string,
  ): Promise<ZoneDetails> {
    return await service.getZoneDetails(zone)
  }

  @Authorized('admin')
  @Mutation(() => Boolean)
  async createZone(
    @Arg("input", () => NewZone) input: NewZone,
  ): Promise<boolean> {
    return await service.createNewZone(input)
  }

  @Authorized(["admin"])
  @Query(() => [PermitsByDay])
  async getPermitStats(): Promise<PermitsByDay[]> {
    return await service.getAllPermitsByDay();
  }

  @Authorized('driver')
  @Query(() => LotDetails)
  async lotDetails(
    @Arg("lot", () => String) lot: string,
  ): Promise<LotDetails> {
    return await service.getLotDetails(lot)
  }

  @Authorized('driver')
  @Mutation(() => Confirmation)
  async purchaseLotPermit(
    @Arg("input", () => PurchaseLotInput) input: PurchaseLotInput,
    @Ctx() request: Request
  ): Promise<Confirmation> {
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

    if (!vehicleId) {
      throw new Error('Vehicle not found')
    }
    
    const purchaseMyZonePermit = await service.purchaseMyLotPermit({
      vehicle: vehicleId,
      lot: input.lot,
      duration: input.duration,
      paymentMethod: input.paymentMethod
    })

    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = await this.getUserData(token);
    const durationString = "";
    // if (input.duration?.hours && input.duration?.minutes) {
    //   if (input.duration.hours > 1) {
    //   durationString += `${input.duration.hours} hours`
    //   } else {
    //     durationString += `${input.duration.hours} hour`
    //   }
    //   if (input.duration.minutes > 1) {
    //     durationString += ` ${input.duration.minutes} minutes`
    //   } else {
    //     durationString += ` ${input.duration.minutes} minute`
    //   }
    // } else if (input.duration?.hours) {
    //   if (input.duration.hours > 1) {
    //     durationString = `${input.duration.hours} hours`
    //   } else {
    //     durationString = `${input.duration.hours} hour`
    //   }
    // } else if (input.duration?.minutes) {
    //   durationString = `${input.duration.minutes} minutes`
    // }

    let brand;
    switch (input.paymentMethod.split(" ")[0]) {
      case 'visa':
        brand = 'https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png'
        break
      case 'mastercard':
        brand = 'https://www.mastercard.com/content/dam/public/brandcenter/assets/images/logos/mclogo-for-footer.svg'
        break
      case 'amex':
        brand = 'https://www.aexp-static.com/cdaas/one/statics/axp-static-assets/1.8.0/package/dist/img/logos/dls-logo-bluebox-solid.svg'
        break
      case 'discover':
        brand = 'https://www.discover.com/content/dam/discover/en_us/credit-cards/card-acquisitions/grey-redesign/global/images/icons/icon-discover-logo-136-23.png'
        break
      default:
        brand = input.paymentMethod.split(" ")[0] ? input.paymentMethod.split(" ")[0] : input.paymentMethod
        break
    }
    const b = input.paymentMethod.split(" ")[0] ? input.paymentMethod.split(" ")[0] : undefined
    const showLogo = b && (b === 'visa' || b === 'mastercard' || b === 'amex' || b === 'discover')

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
            <p><strong>Lot:</strong> ${input.lot}</p>
            <p><strong>Duration:</strong> ${durationString}</p>
            <p><strong>Vehicle Plate:</strong> ${plate}</p>
            <p><strong>Payment Method: ${!showLogo ? brand: `<img src=${brand} alt="${b}" style="height: 1em; vertical-align: middle;" /> ${input.paymentMethod.split(" ")[1]}`}</strong></p>
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
}
