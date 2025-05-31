import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import { AdminService } from "./service";
import { 
  User,
  NewUser,
  UserInput,
  APIUser,
  APICredential,
  APIUserID,
  // ReportDay
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
  ): Promise<User[] | undefined> {
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
  @Query(() => String)
  async generateReport(
      @Ctx() request: Request
  ): Promise<String> {
    const ticketQuery = `
      query AdminTicketReport {
        adminTicketReport {
          totalTickets
          totalFines
          totalPaid
          totalUnpaid
          totalOverdue
          ticketsByStatus {
            status
            count
          }
          ticketsByViolation {
            violation
            count
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
    console.log(ticketJson)

    const permitQuery = `
      query AdminPermitReport {
        adminPermitReport {
          totalPermits
          totalActive
          totalExpired
          totalRevoked
          permitsByType {
            type
            count
          }
          permitsByStatus {
            status
            count
          }
        }
      }
    `
    const permitRes = await fetch('http://localhost:4003/graphql', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line
      // @ts-ignore
      Authorization: `${request.headers.authorization}`,
      },
      body: JSON.stringify({
        query: permitQuery,
      }),
    })

    const permitJson = await permitRes.json()
    console.log(permitJson)

    return 'remove this later, this is just a placeholder for the report generation';

    // still need to add permit data and aggregate it
  }
}