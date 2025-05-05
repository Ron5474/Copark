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
    @Arg("enforcer", () => UserInput) enforcer: UserInput
  ): Promise<User[]> {
    return adminService.suspendUser(enforcer);
  }
}