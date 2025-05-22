import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
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

  @Mutation(() => [ReportDay])
  @Authorized(["admin"])
  async generateReport(
  ): Promise<ReportDay[]> {
    return;
  }
}