import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
import { AdminService } from "./service";
import { 
  User,
  NewUser,
  UserInput
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

  @Mutation(() => [User])
  @Authorized(["admin"])
  async addEnforcer(
    @Arg("enforcer", () => NewUser) enforcer: NewUser
  ): Promise<User[]> {
    return adminService.addEnforcer(enforcer);
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
  async reinstateUser(
    @Arg("user", () => UserInput) user: UserInput
  ): Promise<User[]> {
    return adminService.reinstateUser(user);
  }
}