import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
import { TicketService } from "./service";
import { 
  Ticket,
  NewTicket,
  TicketInput,
} from "./schema";

const ticketService = new TicketService();

@Resolver()
export class TicketResolver {
  @Query(() => [Ticket])
  @Authorized(["driver"])
  async getTickets(): Promise<Ticket[]> {
    return ticketService.getTickets();
  }

  // @Mutation(() => [User])
  // @Authorized(["admin"])
  // async addEnforcer(
  //   @Arg("enforcer", () => NewUser) enforcer: NewUser
  // ): Promise<User[]> {
  //   return adminService.addEnforcer(enforcer);
  // }
}