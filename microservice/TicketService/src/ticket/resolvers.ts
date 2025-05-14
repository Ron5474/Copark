import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from "type-graphql";

import { TicketService } from "./service";
import { 
  Ticket,
  NewTicket,
  ModifyTicketInput,
  TicketInput,
  hasTicket,
  EmailInput
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
  async getMyTickets(@Ctx() request: Request & {user: SessionUser}): Promise<Ticket[] | undefined> {
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

    let result;

    try {
      const response = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `${userJWT}`
      },
      body: JSON.stringify(vehicleQuery)
      });

      if (response.status !== 200) {
        console.error('Vehicle Fetching Error', response);
        throw new Error('Failed to fetch vehicles for user111');
      }

      result = await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles for user');
    }

    console.log(result)
    return await ticketService.getTicketsForVehicleID(result.data.getVehicleByUserId)
  }

  @Mutation(() => Ticket)
  @Authorized(["enforcer", "admin"])
  async createTicket(@Arg("newTicket", () => NewTicket) newTicket: NewTicket): Promise<Ticket> {
    return ticketService.createTicket(newTicket);
  }

  @Mutation(() => Ticket, { nullable: true })
  @Authorized(["enforcer", "admin"])
  async modifyTicket(@Arg("input", () => ModifyTicketInput) input: ModifyTicketInput): Promise<Ticket | null> {
    return ticketService.modifyTicket(input);
  }

  @Mutation(() => Ticket, { nullable: true })
  @Authorized(["enforcer", "admin"])
  async deleteTicket(@Arg("id", () => TicketInput) id: TicketInput): Promise<Ticket | null> {
    return ticketService.deleteTicket(id);
  }

  //need to add getTicketByEmail
  @Authorized('registrar', 'payroll')
  @Query(() => hasTicket)
  async hasPendingTicket (
    @Arg("email", () => EmailInput) email: EmailInput,
  ): Promise<hasTicket> {
    
    let userID;
    try {
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

      if (response.status !== 200) {
        console.error('Email Fetching Error', response);
        throw new Error('Fetched to get user ID');
      }

      userID = await response.json();
    } catch (error) {
      void error;
      throw new Error('Fetched to get user ID, check auth service');
    }

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
    vehicleResult.data?.getVehicleByUserId?.map((v: {id: string}) => v.id) ?? [];

  if (vehicleIDs.length === 0) return {hasTicket: false};

    const tickets = await ticketService.getTicketsForVehicleID(vehicleIDs)
    if (!tickets) return {hasTicket: false}
    if (tickets?.length > 0) {
      return {hasTicket: true}
    }
    return {hasTicket: false}
  }
}