import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
import { TicketService } from "./service";
import { 
  Ticket,
  NewTicket,
  ModifyTicketInput,
  TicketInput
} from "./schema";

const ticketService = new TicketService();

@Resolver()
export class TicketResolver {
  @Query(() => [Ticket])
  @Authorized(["admin"])
  async getTickets(): Promise<Ticket[]> {
    return ticketService.getTickets();
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
}