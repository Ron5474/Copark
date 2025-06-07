import { IsEmail } from "class-validator";
import { Field, ObjectType, InputType, ID } from "type-graphql";

@InputType()
export class ReportDays {
  @Field(() => Number)
  days!: number;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field(() => String)  
  name!: string;

  @Field(() => String)  
  email!: string;

  @Field(() => String)  
  accountStatus!: string;

  @Field(() => String, { nullable: true })
  password?: string;
}

@InputType()
export class NewUser {
  @Field(() => String)  
  name!: string;

  @Field(() => String)  
  email!: string;
}

@InputType()
export class UserInput {
  @Field(() => ID)
  id!: string;
}

@InputType()
export class APICredential {
  @Field(() => String)
  name!: string

  @Field(() => String)
  email!: string

  @Field(() => String)
  role!: string
}

@ObjectType()
export class APIUserID {
  @Field(() => ID)
  id!: string
}

@ObjectType()
export class APIUser {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  @IsEmail()
  email!: string

  @Field(() => String)
  role!: string

  @Field(() => String)
  accountStatus!: string
}

@ObjectType()
export class ViolationBreakdown {
  @Field(() => String)
  violation!: string;

  @Field(() => Number)
  count!: number;
}

@ObjectType()
export class EnforcerBreakdown {
  @Field(() => String)
  enforcer!: string;

  @Field(() => Number)
  count!: number;
}


@ObjectType()
export class TicketReport {
  @Field(() => Number)
  totalTickets!: number;

  @Field(() => Number)
  unpaidTickets!: number;

  @Field(() => Number)
  paidTickets!: number;

  @Field(() => Number)
  totalRevenue!: number;

  @Field(() => [ViolationBreakdown])
  violationBreakdown!: ViolationBreakdown[];

  @Field(() => [EnforcerBreakdown])
  enforcerBreakdown!: EnforcerBreakdown[];
}

@ObjectType()
export class ZoneStats {
  @Field(() => String)
  area!: string

  @Field(() => Number)
  totalPermits!: number
}

@ObjectType()
export class LotStats {
  @Field(() => String)
  area!: string

  @Field(() => String)
  durationType!: string

  @Field(() => Number)
  totalPermits!: number
}

@ObjectType()
export class PermitReport {
  @Field(() => Number)
  totalPermits!: number

  @Field(() => Number)
  activePermits!: number

  @Field(() => Number)
  expiredPermits!: number

  @Field(() => Number)
  totalRevenue!: number

  @Field(() => [ZoneStats])
  zoneBreakdown!: ZoneStats[]

  @Field(() => [LotStats])
  lotBreakdown!: LotStats[]
}