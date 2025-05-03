import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { AdminService } from "./service";
import { EnforcementUser, NewEnforcementUser } from "./schema";

const adminService = new AdminService();

@Resolver()
export class AdminResolver {
  @Query(() => [EnforcementUser])
  // @Authorized(["admin"])
  async getEnforcers(): Promise<EnforcementUser[]> {
    return adminService.getEnforcers();
  }

  @Mutation(() => [EnforcementUser])
  // @Authorized(["admin"])
  async addEnforcer(
    @Arg("enforcer") enforcer: NewEnforcementUser
  ): Promise<EnforcementUser[]> {
    return adminService.addEnforcer(enforcer);
  }
}