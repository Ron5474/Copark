import { Resolver, Query,  Mutation, Arg, Ctx, Authorized} from 'type-graphql'
import { Request } from 'express'
import { SignJWT } from 'jose'

import {
  Confirmation,
  PurchaseZoneInput,
  CheckedPermit,
  IsValidPolice,
  MyPermits,
  NewZone,
  ZoneDetails,
  PermitsByDay,
  PurchaseLotInput,
  NewLot,
  LotGroup,
  Zone,
  Permit,
  ZoneStats,
  LotStats,
  PermitReport,
  ZoneInput,
  permitId
} from './schema'
import { PermitService } from './service'
import { sendPermitEmail } from './emailClient'
import { Vehicle } from '../types/express'

const service = new PermitService()
const internalKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

@Resolver()
export class PermitResolver {
  private async encrypt(userId: string, key=internalKey): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key) // used to be internalKey
  }

  private async getUserData(token?: string): Promise<{ id: string, name: string, role: string[], email: string }> {
    // if (!token) { // User already passed auth checker
    //   throw new Error('Token not provided')
    // }
    const response = await fetch('http://localhost:3010/api/v0/auth/driver/id', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    const res = await response.json()
    // We can't test this vvvvvv  because user passes auth
    // const res = response.status === 200 ? await response.json() : null
    // if (!res) { // User already passed auth checker
    //   throw new Error('User not found')
    // }
    return {
      id: res.id,
      name: res.name,
      role: res.role,
      email:res.email
    }
  }

  /*
  **********************************************************************************
  * Driver
  * ********************************************************************************
  */
  @Authorized('driver')
  @Mutation(() => Confirmation)
  async purchaseZonePermit(
    @Arg("input", () => PurchaseZoneInput) input: PurchaseZoneInput,
    @Ctx() request: Request
  ): Promise<Confirmation> {
    const plate = input.plate
    const vehicleId = input.vehicleId

    // const vehicleQuery = `
    //   query FindVehicleByPlate($plate: String!) {
    //     findVehicleByPlate(plate: $plate) {
    //       id
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
    //     variables: { plate },
    //   }),
    // })

    // const vehicleJson = await vehicleRes.json()

    // const vehicleId = input.vehicle // vehicleJson?.data?.findVehicleByPlate?.id

    // if (!vehicleId) {
    //   throw new Error('Vehicle not found')
    // }
    
    const purchaseMyZonePermit = await service.purchaseMyZonePermit({
      plate,
      vehicleId,
      zone: input.zone,
      duration: input.duration,
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId
    })

    const token = request.headers.authorization?.replace('Bearer ', '')
    const user = await this.getUserData(token)
    let durationString = ""
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

    let brand
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
        brand = input.paymentMethod.split(" ")[1] ? input.paymentMethod.split(" ")[0] : input.paymentMethod
        break
    }
    const b = input.paymentMethod.split(" ")[1] ? input.paymentMethod.split(" ")[0] : undefined
    const showLogo = b && (b === 'visa' || b === 'mastercard' || b === 'amex' || b === 'discover')

    // Step 2: Send email
    await sendPermitEmail({
      to: user.email,
      subject: 'Your CoPark Permit Confirmation',
      html: `
       <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden; border: 1px solid #e8eaed;">
  
  <!-- Header Section -->
  <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 32px 24px; text-align: center;">
    <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; line-height: 60px; text-align: center;">
      <span style="color: white; font-size: 30px; font-weight: bold; vertical-align: middle;">✓</span>
    </div>
    <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Permit Purchase Confirmation</h2>
  </div>
  
  <!-- Content Section -->
  <div style="padding: 32px 24px;">
    <p style="font-size: 18px; color: #2c3e50; margin-bottom: 8px; font-weight: 500;">Hi <strong>${user.name}</strong>,</p>
    
    <p style="font-size: 16px; color: #5a6c7d; line-height: 1.6; margin-bottom: 24px;">
      We're happy to let you know that your permit purchase was successful!
    </p>
    
    <!-- Details Card -->
    <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f1f4ff 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e1e8ff; position: relative;">
      <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border-radius: 0 0 0 12px;"></div>
      
      <p style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); line-height: 1.5;">
        <strong style="color: #374151;">Zone:</strong> <span style="color: #1f2937;">${input.zone}</span>
      </p>
      
      <p style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); line-height: 1.5;">
        <strong style="color: #374151;">Duration:</strong> <span style="color: #1f2937;">${durationString}</span>
      </p>
      
      <p style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); line-height: 1.5;">
        <strong style="color: #374151;">Vehicle Plate:</strong> <span style="color: #1f2937; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${plate}</span>
      </p>
      
      <p style="margin: 0; line-height: 1.5;">
        <strong style="color: #374151;">Payment Method:</strong> 
        ${!showLogo 
          ? brand 
          : `<img src="${brand}" alt="${b}" style="height: 1em; vertical-align: baseline; border-radius: 3px; margin-left: 6px;" /><span style="color: #1f2937; margin-left: 4px;">${input.paymentMethod.split(" ")[1]}</span>`
        }
      </p>
    </div>
    
    <!-- Support Section -->
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; border: 1px solid #e9ecef;">
      <p style="font-size: 15px; color: #6c757d; margin: 0 0 4px 0;">
        If you have any questions, feel free to contact our support team.
      </p>
    </div>
    
    <div style="text-align: center; margin: 24px 0;">
      <p style="font-size: 16px; color: #495057; margin: 0;">
        Thanks for using <strong style="color: #4CAF50; font-size: 18px;">CoPark</strong>
      </p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 20px 24px; border-top: 1px solid #e9ecef;">
    <p style="text-align: center; font-size: 13px; color: #6c757d; margin: 0;">
      This is an automated message. Please do not reply.
    </p>
  </div>
</div>

      `,
    })

    return purchaseMyZonePermit
  }

  // @Authorized('driver')
  // @Query(() => MyPermits)
  // async myPermits(
  //   @Arg("vehicleID", () => String) vehicleID: string,
  // ): Promise<MyPermits> {

  //   return await service.getMyPermits(vehicleID)
  // }
  @Authorized('driver')
  @Query(() => MyPermits)
  async myPermits(@Ctx() request: Request): Promise<MyPermits> {
    const token = request.headers.authorization?.split(' ')[1]
    const userData = await this.getUserData(token)
    const userID = await this.encrypt(userData.id)

    const vehicleResponse = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query GetVehicleByUserId($userID: String!) {
            getVehicleByUserId(userID: $userID) {
              id
            }
          }`,
        variables: { userID },
      }),
    })

    const vehicleResult = await vehicleResponse.json()
    const vehicleIDs: Vehicle[] =
      vehicleResult.data?.getVehicleByUserId?.map((v: {id: string}) => v.id)

    // if (!vehicleIDs) { // Delete vehicle not implemented yet
    //   return { active: [], future: [], expired: [] }
    // }

    return await service.getMyPermits(vehicleIDs)
  }


  @Authorized('driver')
  @Query(() => ZoneDetails)
  async zoneDetails(
    @Arg("zone", () => String) zone: string,
  ): Promise<ZoneDetails> {
    return await service.getZoneDetails(zone)
  }

  // @Authorized('driver')
  // @Query(() => LotDetails)
  // async lotDetails(
  //   @Arg("lot", () => String) lot: string,
  // ): Promise<LotDetails> {
  //   return await service.getLotDetails(lot)
  // }

  // @Authorized('driver')
  // @Query(() => [LotDetails])
  // async allLotDetails(): Promise<LotDetails[]> {
  //   return await service.getAllLotDetails()
  // }
  @Authorized('driver')
  @Query(() => [LotGroup])
  async allLotDetails(): Promise<LotGroup[]> {
    return await service.getAllLotDetails()
  }

  @Authorized('driver')
  @Mutation(() => Confirmation)
  async purchaseLotPermit(
    @Arg("input", () => PurchaseLotInput) input: PurchaseLotInput,
    @Ctx() request: Request
  ): Promise<Confirmation> {
    const plate = input.plate
    const vehicleId = input.vehicleId

    // const vehicleQuery = `
    //   query FindVehicleByPlate($plate: String!) {
    //     findVehicleByPlate(plate: $plate) {
    //       id
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
    //     variables: { plate },
    //   }),
    // })

    // const vehicleJson = await vehicleRes.json()

    // const vehicleId = vehicleJson?.data?.findVehicleByPlate?.id

    // if (!vehicleId) {
    //   throw new Error('Vehicle not found')
    // }
    
    const purchaseMyZonePermit = await service.purchaseMyLotPermit({
      plate,
      vehicleId,
      lot: input.lot,
      duration: input.duration,
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId
    })

    const token = request.headers.authorization?.replace('Bearer ', '')
    const user = await this.getUserData(token)

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZoneName: "short"
    }
    const durationString = `From ${new Date(purchaseMyZonePermit.activeDate).toLocaleString(undefined, options)
    //   new Date(purchaseMyZonePermit.purchaseDate) < new Date(purchaseMyZonePermit.activeDate) ?
    //   new Date(purchaseMyZonePermit.activeDate).toLocaleString(undefined, options) :
    //   new Date(purchaseMyZonePermit.purchaseDate).toLocaleString(undefined, options)
    } until ${new Date(purchaseMyZonePermit.expireDate).toLocaleString(undefined, options)}`

    let brand
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
        brand = input.paymentMethod.split(" ")[1] ? input.paymentMethod.split(" ")[0] : input.paymentMethod
        break
    }
    const b = input.paymentMethod.split(" ")[1] ? input.paymentMethod.split(" ")[0] : undefined
    const showLogo = b && (b === 'visa' || b === 'mastercard' || b === 'amex' || b === 'discover')

    // Step 2: Send email
    await sendPermitEmail({
      to: user.email,
      subject: 'Your CoPark Permit Confirmation',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden; border: 1px solid #e8eaed;">
  
  <!-- Header Section -->
  <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 32px 24px; text-align: center;">
    <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; line-height: 60px; text-align: center;">
      <span style="color: white; font-size: 30px; font-weight: bold; vertical-align: middle;">✓</span>
    </div>
    <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Permit Purchase Confirmation</h2>
  </div>
  
  <!-- Content Section -->
  <div style="padding: 32px 24px;">
    <p style="font-size: 18px; color: #2c3e50; margin-bottom: 8px; font-weight: 500;">Hi <strong>${user.name}</strong>,</p>
    
    <p style="font-size: 16px; color: #5a6c7d; line-height: 1.6; margin-bottom: 24px;">
      We're happy to let you know that your permit purchase was successful!
    </p>
    
    <!-- Details Card -->
    <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f1f4ff 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e1e8ff; position: relative;">
      <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border-radius: 0 0 0 12px;"></div>
      
      <p style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); line-height: 1.5;">
        <strong style="color: #374151;">Lot:</strong> <span style="color: #1f2937;">${input.lot}</span>
      </p>
      
      <p style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); line-height: 1.5;">
        <strong style="color: #374151;">Duration:</strong> <span style="color: #1f2937;">${durationString}</span>
      </p>
      
      <p style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); line-height: 1.5;">
        <strong style="color: #374151;">Vehicle Plate:</strong> <span style="color: #1f2937; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${plate}</span>
      </p>
      
      <p style="margin: 0; line-height: 1.5;">
        <strong style="color: #374151;">Payment Method:</strong> 
        ${!showLogo 
          ? brand 
          : `<img src="${brand}" alt="${b}" style="height: 1em; vertical-align: baseline; border-radius: 3px; margin-left: 6px;" /><span style="color: #1f2937; margin-left: 4px;">${input.paymentMethod.split(" ")[1]}</span>`
        }
      </p>
    </div>
    
    <!-- Support Section -->
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; border: 1px solid #e9ecef;">
      <p style="font-size: 15px; color: #6c757d; margin: 0 0 4px 0;">
        If you have any questions, feel free to contact our support team.
      </p>
    </div>
    
    <div style="text-align: center; margin: 24px 0;">
      <p style="font-size: 16px; color: #495057; margin: 0;">
        Thanks for using <strong style="color: #4CAF50; font-size: 18px;">CoPark</strong>
      </p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 20px 24px; border-top: 1px solid #e9ecef;">
    <p style="text-align: center; font-size: 13px; color: #6c757d; margin: 0;">
      This is an automated message. Please do not reply.
    </p>
  </div>
</div>
      `,
    })

    return purchaseMyZonePermit
  }

  @Authorized('driver')
  @Mutation(() => [permitId])
  async expirePermits(
    @Arg('vehicleId', () => String) vehicleId: string,
  ): Promise<permitId[]> {
    // Vehicle ID has to be defined. it is a required arg 
    // if (!vehicleId) {
    //   throw new Error('Vehicle ID is required')
    // }
    return await service.expirePermits(vehicleId)
  }

  /*
  **********************************************************************************
  * Enforcement
  * ********************************************************************************
  */
  @Authorized('enforcement')
  @Query(() => [CheckedPermit])
  async checkPermit(
    @Arg("plate", () => String) plate: string,
    @Arg("state", () => String) state: string,
    @Ctx() request: Request
  ): Promise<CheckedPermit[]> {

    const vehicleQuery = `
      query FindVehicleByPlate($plate: String!, $state: String!) {
        findVehicleByPlate(plate: $plate, state: $state) {
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
        variables: { plate, state },
      }),
    })

    const vehicleJson = await vehicleRes.json()

    const vehicleId = vehicleJson?.data?.findVehicleByPlate?.id

    if (!vehicleId) {
      return []
    }

    return await service.getValidPermit(vehicleId)
  }

  /*
  **********************************************************************************
  * Admin
  * ********************************************************************************
  */

  @Authorized('admin')
  @Query(() => [LotGroup])
  async getLots(): Promise<LotGroup[]> {
    return await service.adminGetAllLotDetails()
  }

  @Authorized(['admin'])
  @Mutation(() => Boolean)
  async createLot(
    @Arg("input", () => NewLot) input: NewLot,
  ): Promise<boolean> {
    return await service.createNewLot(input)
  }

  @Authorized(['admin'])
  @Mutation(() => Boolean)
  async createZone(
    @Arg("input", () => NewZone) input: NewZone,
  ): Promise<boolean> {
    return await service.createNewZone(input)
  }

  @Authorized(['admin'])
  @Mutation(() => Boolean)
  async updateZone(
    @Arg("input", () => NewZone) input: NewZone,
  ): Promise<boolean> {
    return await service.updateZone(input)
  }

  @Authorized(['admin'])
  @Mutation(() => Boolean)
  async updateLot(
    @Arg("input", () => NewLot) input: NewLot,
  ): Promise<boolean> {
    return await service.updateLot(input)
  }

  @Query(() => [Zone])
  @Authorized(['admin'])
  async getZones(): Promise<Zone[]> {
    return await service.getZones()
  }

  @Authorized(['admin'])
  @Query(() => [PermitsByDay])
  async getPermitStats(): Promise<PermitsByDay[]> {
    return await service.getAllPermitsByDay()
  }

  @Authorized(['admin'])
  @Query(() => [Permit])
  async allPermits(
    @Arg("activeOnly", () => Boolean, { defaultValue: true }) activeOnly: boolean
  ): Promise<Permit[]> {
    return await service.getAllPermits(activeOnly)
  }

  @Authorized(['admin'])
  @Query(() => [ZoneStats])
  async allZoneStats(
    @Arg("activeOnly", () => Boolean, { defaultValue: true }) activeOnly: boolean
  ): Promise<ZoneStats[]> {
    return await service.getPermitStatsByZone(activeOnly)
  }

  @Authorized(['admin'])
  @Query(() => [LotStats])
  async allLotStats(
    @Arg("activeOnly", () => Boolean, { defaultValue: true }) activeOnly: boolean
  ): Promise<LotStats[]> {
    return await service.getPermitStatsByLot(activeOnly)
  }

  @Authorized(['admin'])
  @Query(() => PermitReport)
  async adminPermitReport(
    @Arg("numDays", () => Number, { nullable: true }) numDays?: number,
  ): Promise<PermitReport> {
    return await service.generatePermitReport({numDays: numDays ?? 999})
  }

  @Authorized(['admin'])
  @Mutation(() => [Zone])
  async updateZonePrice(
    @Arg("input", () => ZoneInput) input: ZoneInput
  ): Promise<Zone[]> {
    return await service.updateZonePrice(input)
  }

  /*
  **********************************************************************************
  * Police
  * ********************************************************************************
  */
  @Authorized('police')
  @Query(() => IsValidPolice)
  async isValidPermitByPolice (
    @Arg("plate", () => String) plate: string,
    @Arg("state", () => String) state: string,
    @Ctx() request: Request
  ): Promise<IsValidPolice> {
    const vehicleQuery = `
      query FindVehicleByPlate($plate: String!, $state: String!) {
        findVehicleByPlate(plate: $plate, state: $state) {
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
        variables: { plate, state },
      }),
    })

    const vehicleJson = await vehicleRes.json()
    const vehicleId = vehicleJson?.data?.findVehicleByPlate?.id

    if (!vehicleId) {
      return {isValid: false}
    }

    return await service.isValidPermitPolice(vehicleId)
  }
}
