import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import { Request } from 'express'
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

const ticketService = new TicketService();

@Resolver()
export class TicketResolver {
  @Query(() => [Ticket])
  @Authorized(["admin"])
  async getTickets(): Promise<Ticket[]> {
    return ticketService.getTickets();
  }

  @Query(() => [Ticket])
  @Authorized(["driver"])
  async getMyTickets(@Ctx() request: Request & {user: SessionUser}): Promise<Ticket[]> {
    // eslint-disable-next-line
    // @ts-ignore
    const userJWT = request.headers.authorization?.split(' ')[1];
    // console.log(userJWT)

    const vehicleQuery = {
      query: `
      query {
        getVehicleByUserId(userID: "${userJWT}") {
          id
        }
      }
      `
    };

    const response = await fetch('http://localhost:4001/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `${userJWT}`
    },
    body: JSON.stringify(vehicleQuery)
    });

    const result = await response.json();

    return await ticketService.getTicketsForVehicleID(result.data.getVehicleByUserId)
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

      // if (!vehicleId) {
      //   throw new Error("Unable to resolve vehicle ID");
      // }

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

    // get vehicles for userID

    const vehicleQuery = {
    query: `
      query {
        getVehicleByUserId(userID: "${userID.id}") {
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

  const vehicleIDs: string[] =
    vehicleResult.data?.getVehicleByUserId?.map((v: {id: string}) => v.id);

  if (vehicleIDs.length === 0) return {hasTicket: false};

    const tickets = await ticketService.getTicketsForVehicleID(vehicleIDs)

    if (tickets?.length > 0) {
      return {hasTicket: true}
    }
    return {hasTicket: false}
  }
}