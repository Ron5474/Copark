import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import { AdminService } from "./service";
import { 
  User,
  NewUser,
  UserInput,
  APIUser,
  APICredential,
  APIUserID,
  ReportDay
} from "./schema";

const adminService = new AdminService();

@Resolver()
export class AdminResolver {
  @Query(() => [User])
  @Authorized(["admin"])
  async getEnforcers(): Promise<User[]> {
    return adminService.getEnforcers();
  }

  @Query(() => [User])
  @Authorized(["admin"])
  async getDrivers(): Promise<User[]> {
    return adminService.getDrivers();
  }

  @Query(() => [APIUser])
  @Authorized(["admin"])
  async getAPIUsers(): Promise<APIUser[]> {
    return adminService.getAPIUsers();
  }

  @Mutation(() => [User])
  @Authorized(["admin"])
  async addEnforcer(
    @Arg("enforcer", () => NewUser) enforcer: NewUser
  ): Promise<User[]> {
    return adminService.addEnforcer(enforcer);
  }

  @Mutation(() => APIUser)
  @Authorized(["admin"])
  async addAPIUser(
    @Arg("organization", () => APICredential) organization: APICredential
  ): Promise<APIUserID | undefined> {
    return adminService.addAPIUser(organization)
  }

  @Mutation(() => [User])
  @Authorized(["admin"])
  async suspendUser(
    @Arg("user", () => UserInput) user: UserInput
  ): Promise<User[]> {
    return adminService.suspendUser(user);
  }

  @Mutation(() => [User])
  @Authorized(["admin"])
  async deleteUser(
    @Arg("user", () => UserInput) user: UserInput
  ): Promise<User[]> {
    return adminService.deleteUser(user);
  }

  @Mutation(() => [User])
  @Authorized(["admin"])
  async reinstateUser(
    @Arg("user", () => UserInput) user: UserInput
  ): Promise<User[]> {
    return adminService.reinstateUser(user);
  }

  @Authorized(["admin"])
  @Query(() => [ReportDay])
  async generateReport(
      @Ctx() request: Request
  ): Promise<ReportDay[]> {
    const ticketQuery = `
      query GetTicketsStats{
        getTicketsStats {
          date
          Ticket {
            id
          }
        }
      }
    `
    const ticketRes = await fetch('http://localhost:4002/graphql', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line
      // @ts-ignore
      Authorization: `${request.headers.authorization}`,
      },
      body: JSON.stringify({
      query: ticketQuery,
      }),
    })

    const ticketJson = await ticketRes.json()
    const ticketData = ticketJson?.data?.getPermitStats

    console.log(ticketData)
    return ticketData;

    // still need to add permit data and aggregate it
  }
}