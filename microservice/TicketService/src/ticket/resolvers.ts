import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import { Request } from 'express'
import { SignJWT } from 'jose'
import { TicketService } from "./service";
import { 
  Ticket,
  NewTicket,
  ModifyTicketInput,
  TicketInput,
  hasTicket,
  EmailInput,
  NewTicketInput
} from "./schema";

import { SessionUser } from "src";
import { Vehicle } from "src/types/express";

const ticketService = new TicketService();
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
  private async getVehicleById(userID: string): Promise<Vehicle[]> {
    if (!userID) {
      throw new Error('User ID not provided')
    }

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
      role: res.role
    };
  }

  @Query(() => [Ticket])
  @Authorized(["admin"])
  async getTickets(): Promise<Ticket[]> {
    return ticketService.getTickets();
  }

  @Query(() => [Ticket])
  @Authorized(["admin"])
  async getTicketsStats(): Promise<Record<string, Ticket[]>> {
    return ticketService.getAllTicketsCount();
  }

  @Query(() => [Ticket])
  @Authorized(["admin"])
  async getTicketsIssuedByEnforcer(
    @Arg("enforcerID", () => String) enforcerID: string
  ): Promise<Ticket[] | undefined> {
    return ticketService.getTicketsIssuedByEnforcer(enforcerID);
  }

  @Query(() => [Ticket])
  @Authorized(["driver"])
  async getMyTickets(@Ctx() request: Request & {user: SessionUser}): Promise<Ticket[]> {
    // eslint-disable-next-line
    // @ts-ignore
    // const userJWT = request.headers.authorization?.split(' ')[1];
    // console.log('User: ', userJWT)
    const token = request.headers.authorization?.split(' ')[1]
    const userId = (await this.getUserData(token)).id

    const userEncrypted = await encrypt(userId, emailEncodedKey)
    
    const vehicleIDs: Vehicle[] = await this.getVehicleById(userEncrypted)

    return await ticketService.getTicketsForVehicleID(vehicleIDs)
  }

  @Mutation(() => Ticket)
  @Authorized(["enforcement", "admin"])
  async createTicket(@Arg("newTicket", () => NewTicket) newTicket: NewTicket): Promise<Ticket> {
    return ticketService.createTicket(newTicket);
  }

  @Mutation(() => Ticket, { nullable: true })
  @Authorized(["enforcement", "admin"])
  async modifyTicket(@Arg("input", () => ModifyTicketInput) input: ModifyTicketInput): Promise<Ticket | null> {
    return ticketService.modifyTicket(input);
  }

  @Mutation(() => Ticket, { nullable: true })
  @Authorized(["enforcement", "admin"])
  async deleteTicket(@Arg("id", () => TicketInput) id: TicketInput): Promise<Ticket | null> {
    return ticketService.deleteTicket(id);
  }

  @Mutation(() => Ticket)
  @Authorized(["enforcement", "admin"])
    async createNewTicket(
      @Arg("input", () => NewTicketInput) input: NewTicketInput,
      @Ctx() request: Request
    ): Promise<Ticket> {
      const plate = input.plate
      const vehicleQuery = `
        mutation FindOrCreateVehicleByPlate($plate: String!) {
          findOrCreateVehicleByPlate(plate: $plate) {
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
          variables: { plate: plate },
        }),
      });
      const vehicleJson = await vehicleRes.json();
      const vehicleId = vehicleJson?.data?.findOrCreateVehicleByPlate?.id;

      return ticketService.createTicket({
      enforcer: (request.headers.authorization as string).split(' ')[1],
      vehicle: vehicleId,
      violation: input.reason,
      fine: 50,
      note: input.note,
      images: input.images,
    })
  }

  //need to add getTicketByEmail
  @Authorized('registrar', 'payroll')
  @Query(() => hasTicket)
  async hasPendingTicket (
    @Arg("email", () => EmailInput) email: EmailInput,
  ): Promise<hasTicket> {

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

    const tickets = await ticketService.getTicketsForVehicleID(vehicleIDs)

    if (tickets?.length > 0) {
      return {hasTicket: true}
    }
    return {hasTicket: false}
  }
}