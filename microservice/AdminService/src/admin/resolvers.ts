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

    const id = await adminService.addAPIUser(organization)
    await fetch('http://localhost:3015/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: organization.email,
        subject: 'API Access Credentials - Copark System',
        html: `
          <div style="font-family: Roboto, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://copark.space/enforcement/assets/copark-enforce-logo.png" alt="Copark Logo" width="120" style="margin: auto;">
              </div>
              
              <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">API Access Granted</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #34495e;">Dear <strong>${organization.name}</strong>,</p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #34495e;">
                Welcome to the Copark API system! Your organization has been successfully registered and granted API access to our platform.
              </p>
              
              <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Your API Credentials:</h3>
                <p style="margin: 10px 0;"><strong>Organization:</strong> ${organization.name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${organization.email}</p>
                <p style="margin: 10px 0;"><strong>Role:</strong> ${organization.role.charAt(0).toUpperCase() + organization.role.slice(1)}</p>
                <p style="margin: 10px 0;"><strong>API Key:</strong> ${id?.id}</p>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0;">Important Security Notes:</h4>
                <ul style="color: #856404; margin: 0;">
                  <li>Keep your API key secure and never share it publicly</li>
                  <li>Use HTTPS for all API requests</li>
                  <li>Contact us immediately if you suspect your key has been compromised</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #34495e;">
                You can now use your API key to integrate with our system based on your assigned role permissions. 
                For API documentation and integration guides, please visit our developer portal.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #34495e;">
                If you have any questions or need technical assistance, please don't hesitate to contact our support team.
              </p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                <p style="color: #7f8c8d; margin: 0;">Best regards,</p>
                <p style="color: #2c3e50; font-weight: bold; margin: 5px 0 0 0;">Copark API Team</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 12px; color: #95a5a6;">
                This email contains sensitive information. Please handle with care.
              </p>
            </div>
          </div>
        `
      })
    });

    return id;
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
    // console.log(ticketJson)
        // Replace enforcer IDs with names in enforcerBreakdown
    if (
      ticketJson?.data?.adminTicketReport?.enforcerBreakdown &&
      Array.isArray(ticketJson.data.adminTicketReport.enforcerBreakdown)
    ) {
      for (const breakdown of ticketJson.data.adminTicketReport.enforcerBreakdown) {
      const enforcerId = breakdown.enforcer;
      // console.log(enforcerId)
      const enforcer = await adminService.getEnforcerbyID(enforcerId);
      breakdown.enforcer = enforcer;
      // console.log(breakdown.enforcer)
      }
    }

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

    const pdf = await generatePdf(ticketJson.data.adminTicketReport, permitJson.data.adminPermitReport, numDays)

    // console.log(pdf)
    return pdf;
  }
}