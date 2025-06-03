import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import { Request } from 'express'
import { SignJWT } from 'jose'
import { TicketService } from "./service";
import { 
  Ticket,
  ModifyTicketInput,
  TicketInput,
  hasTicket,
  EmailInput,
  NewTicketInput,
  TicketsByDay,
  ChallengeTicket,
  PaidTicketInput,
  TicketReport,
} from "./schema";

import { SessionUser } from "src";
import { Vehicle } from "src/types/express";
import { sendTicketIssuedEmail } from './emailClient'

const emailEncodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

async function encrypt(userId: string, key=emailEncodedKey): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(key)
}

@Resolver()
export class TicketResolver {
  constructor(private ticketService: TicketService) {
    this.ticketService = new TicketService();
  }

  private async getVehicleByPlate(plate: string, state: string, userId?: string): Promise<Vehicle | null> {
    const vehicleQuery = {
      query: `
        query FindVehicleByPlate($plate: String!, $state: String!) {
          findVehicleByPlate(plate: $plate, state: $state) {
            id
            plate
          }
        }
      `,
      variables: { plate, state }
    };
    const vehicleResponse = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // '
        'Authorization': 'Bearer ' + userId
      },
      body: JSON.stringify(vehicleQuery)
    });

    const vehicleResult = await vehicleResponse.json();
    const vehicle = vehicleResult.data?.findVehicleByPlate;
    if (!vehicle) {
      return null;
    }
    return {
      id: vehicle.id
    };
  }

  private async getVehicleById(userID: string): Promise<Vehicle[]> {
    const vehicleQuery = {
      query: `
        query {
          getVehicleByUserId(userID: "${userID}") {
            id
          }
        }
      `
    };

    const vehicleResponse = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + (userID)
      },
      body: JSON.stringify(vehicleQuery)
    });

    const vehicleResult = await vehicleResponse.json();
    const vehicleIDs: Vehicle[] =
      vehicleResult.data?.getVehicleByUserId?.map((v: {id: string}) => v.id);
    
    return vehicleIDs
  }

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
    // const res = await response.json()
    if (!res) {
      throw new Error('User not found');
    }
    return {
      id: res.id,
      name: res.name,
      role: res.role
    };
  }

  private async notifyDriverOfTicket(
    vehicleId: string,
    ticket: Ticket,
    enforcerToken: string
  ) {
    // Step 1: Get the driver ID from VehicleService
    const ownerRes = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${enforcerToken}`,
      },
      body: JSON.stringify({
        query: `
          query FindOwner($vehicle: String!) {
            findOwnerByVehicleID(vehicle: $vehicle) {
              id
            }
          }
        `,
        variables: { vehicle: vehicleId },
      }),
    });

    const ownerJson = await ownerRes.json();
    const driverId = ownerJson?.data?.findOwnerByVehicleID?.id;
    // if (!driverId) return console.info("No driver linked — skipping email.");

    // Step 2: Get driver info from AuthService
    const driverRes = await fetch("http://localhost:3010/api/v0/auth/driver/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${enforcerToken}`,
      },
      body: JSON.stringify({ id: driverId }),
    });

    if (!driverRes.ok) {
      // console.warn("Failed to fetch driver email.");
      return;
    }

    const driver = await driverRes.json();

    // Step 3: Send email
    await sendTicketIssuedEmail({
      to: driver.email,
      subject: `A Parking Ticket Has Been Issued for Your Vehicle`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #D32F2F;"> Parking Violation Notice</h2>
          <p>Hello <strong>${driver.name}</strong>,</p>
          <p>Your vehicle has been issued a ticket for the following violation:</p>
          <ul>
            <li><strong>Violation:</strong> ${ticket.violation}</li>
            <li><strong>Date Issued:</strong> ${ticket.issuedDate.toLocaleDateString()}</li>
            ${ticket.note ? `<li><strong>Note:</strong> ${ticket.note}</li>` : ""}
          </ul>
          <p style="margin-top: 20px;">
            <strong>Early Payment Discount:</strong><br>
            If you pay this ticket within <strong>24 hours</strong>, you'll receive a <strong>20% discount</strong>.
          </p>
          <p>
            Please log in to your dashboard to view, pay, or challenge this ticket:
          </p>
          <p>
            <a href="https://copark.space/driver/en/dashboard" style="background-color: #1976D2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Your Ticket</a>
          </p>
          <p>
            <strong>Want to Challenge This Ticket?</strong><br>
            You may submit a challenge request from your dashboard. Be sure to include any evidence or explanation to support your case.
          </p>
          <p style="margin-top: 30px;">Need help? Contact us at <a href="mailto:coparkspace@gmail.com">coparkspace@gmail.com</a>.</p>
          <p style="color: gray; font-size: 0.9em;">This is an automated message from CoPark.</p>
        </div>
      `,
    });
  }


  @Query(() => [Ticket])
  @Authorized(["admin"])
  async getTickets(): Promise<Ticket[]> {
    return this.ticketService.getTickets();
  }

  @Query(() => [TicketsByDay])
  @Authorized(["admin"])
  async getTicketsStats(): Promise<TicketsByDay[]> {
    return this.ticketService.getAllTicketsCount();
  }

  @Query(() => [TicketsByDay])
  @Authorized(["admin"])
  async getTicketsPerDayFromEnforcer(
    @Arg("enforcerID", () => String) enforcerID: string
  ): Promise<TicketsByDay[]> {
    return this.ticketService.getTicketsPerDayFromEnforcer(enforcerID);
  }

  @Query(() => [Ticket])
  @Authorized(["driver"])
  async getMyTickets(@Ctx() request: Request & {user: SessionUser}): Promise<Ticket[]> {
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id
    const userEncrypted = await encrypt(userId, emailEncodedKey)
    
    const vehicleIDs: Vehicle[] = await this.getVehicleById(userEncrypted)
    console.log('Vehicle IDs:', vehicleIDs)

    return await this.ticketService.getTicketsForVehicleID(vehicleIDs)
  }

  @Mutation(() => Ticket, { nullable: true })
  @Authorized(["enforcement", "admin"])
  async modifyTicket(@Arg("input", () => ModifyTicketInput) input: ModifyTicketInput): Promise<Ticket | null> {
    return this.ticketService.modifyTicket(input);
  }

  @Mutation(() => Ticket, { nullable: true })
  @Authorized(["driver"])
  async markTicketAsPaid(@Arg("input", () => PaidTicketInput) input: PaidTicketInput): Promise<Ticket | null> {
    const updatedInput : ModifyTicketInput = {
      id: input.id,
      ticketStatus: 'paid'
    }


    return this.ticketService.modifyTicket(updatedInput);
  }

  @Mutation(() => Ticket, { nullable: true })
  @Authorized(["enforcement", "admin"])
  async deleteTicket(@Arg("id", () => TicketInput) id: TicketInput): Promise<Ticket | null> {
    return this.ticketService.deleteTicket(id);
  }

  @Mutation(() => Ticket)
  @Authorized(["enforcement", "admin"])
    async createNewTicket(
      @Arg("input", () => NewTicketInput) input: NewTicketInput,
      @Ctx() request: Request
    ): Promise<Ticket> {
      const { plate, state } = input
      console.log('Creating new ticket for plate:', plate, 'and state:', state)
      const vehicleQuery = `
        mutation FindOrCreateVehicleByPlate($plate: String!, $state: String!) {
          findOrCreateVehicleByPlate(plate: $plate, state: $state) {
            id
          }
        }
      `;
      const vehicleRes = await fetch("http://localhost:4001/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${request.headers.authorization}`,
        },
        body: JSON.stringify({
          query: vehicleQuery,
          variables: { plate: plate, state: state },
        }),
      });
      const vehicleJson = await vehicleRes.json();
      const vehicleId = vehicleJson?.data?.findOrCreateVehicleByPlate?.id;
      console.log('Vehicle ID:', vehicleId)

      const ticket = await this.ticketService.createTicket({
      enforcer: (request.headers.authorization as string).split(' ')[1],
      vehicle: vehicleId,
      violation: input.reason,
      fine: 50,
      note: input.note,
      images: input.images,
    })
    await this.notifyDriverOfTicket(vehicleId, ticket, (request.headers.authorization as string).split(' ')[1])
    return ticket
  }

  //need to add getTicketByEmail
  @Authorized('registrar', 'payroll')
  @Query(() => hasTicket)
  async hasPendingTicket (
    @Arg("email", () => EmailInput) email: EmailInput,
  ): Promise<hasTicket> {
    // console.log('Checking for pending ticket for email:', email)

    const response = await fetch(
      `http://localhost:3010/api/v0/auth/id?email=${encodeURIComponent(email.email)}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `${request.headers.authorization}`
        },
      }
    );

    const userID = await response.json();
    if (!userID.id) {
      return {hasTicket: false}
    }

    const vehicleIDs: Vehicle[] = await this.getVehicleById(userID.id)
    const tickets = await this.ticketService.getTicketsForVehicleID(vehicleIDs)

    if (tickets?.length > 0) {
      return {hasTicket: true}
    }
    return {hasTicket: false}
  }

  @Mutation(() => ChallengeTicket)
  async challengeTicket(
    @Arg('ticketID', () => TicketInput) ticketID: TicketInput,
    @Arg('challengeReason', () => String) challengeReason: string
  ): Promise<ChallengeTicket | null> {
    return await this.ticketService.challengeTicket(ticketID, challengeReason);
  }

  @Query(() => [ChallengeTicket])
  @Authorized(['admin', 'enforcement'])
  async getChallengedTickets(): Promise<ChallengeTicket[]> {
    return await this.ticketService.getChallengedTickets();
  }

  @Mutation(() => Ticket)
  @Authorized(['admin']) 
  async acceptTicketChallenge(
    @Arg('ticketID', () => TicketInput) ticketID: TicketInput
  ): Promise<Ticket | null> {
    return await this.ticketService.acceptTicketChallenge(ticketID);
  }

  @Mutation(() => Ticket)
  @Authorized(['admin'])
  async rejectTicketChallenge(
    @Arg('ticketID', () => TicketInput) ticketID: TicketInput
  ): Promise<Ticket | null> {
    return await this.ticketService.rejectTicketChallenge(ticketID);
  }

  @Query(() => [Ticket])
  @Authorized(['admin', 'enforcement'])
  async getAcceptedTickets(): Promise<Ticket[]> {
    return await this.ticketService.getAcceptedTickets();
  }

  @Mutation(() => [Ticket])
  @Authorized(['admin'])
  async getUnpaidTickets(
  ): Promise<Ticket[] | null> {
    return await this.ticketService.getUnpaidTicketsPerDay();
    // need to add a convertion from the vehicle ID to the plate number
  }

  @Authorized(['admin'])
  @Query(() => TicketReport)
  async adminTicketReport(
    @Arg("numDays", () => Number, { nullable: true }) numDays?: number,
  ): Promise<TicketReport> {
    return await this.ticketService.generateTicketReport({numDays: numDays ?? 999})
  }

  @Authorized(['driver'])
  @Query(() => [Ticket])
  async pendingTickets(
    @Ctx() request: Request & {user: SessionUser},
    @Arg("plate", () => String) plate: string,
    @Arg("state", () => String) state: string
  ): Promise<Ticket[]> {
    const userToken = request.headers.authorization?.split(' ')[1]
    const vehicleID: Vehicle|null = await this.getVehicleByPlate(plate, state, userToken)
    if (!vehicleID) {
      return []
    }
    return await this.ticketService.getPendingTicketsByPlateNumber(vehicleID.id)
  }
}