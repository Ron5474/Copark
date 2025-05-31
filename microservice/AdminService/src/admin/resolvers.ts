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

import { generatePdf } from "./pdf";

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
    @Ctx() request: Request,
    @Arg("numDays", () => Number) numDays: number
  ): Promise<string> {
    const ticketQuery = `
      query AdminTicketReport {
        adminTicketReport(numDays: ${numDays}) {
          totalTickets
          unpaidTickets
          paidTickets
          totalRevenue
          violationBreakdown {
            violation
            count
          }
          enforcerBreakdown {
            enforcer
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
    // console.log(ticketJson)

    const permitQuery = `
      query AdminPermitReport {
        adminPermitReport(numDays: ${numDays}) {
          totalPermits
          activePermits
          expiredPermits
          totalRevenue
          zoneBreakdown {
            area
            totalPermits
          }
          lotBreakdown {
            area
            totalPermits
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
    // console.log(permitJson)

    const pdf = await generatePdf(ticketJson, permitJson, numDays)

    console.log(pdf)
    return pdf;
  }
}