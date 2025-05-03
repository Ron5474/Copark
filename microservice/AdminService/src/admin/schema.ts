import { Field, ObjectType, InputType, ID } from "type-graphql";

@ObjectType()
export class EnforcementUser {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  accountStatus!: string;
}

@InputType()
export class NewEnforcementUser {
  @Field()
  name!: string;

  @Field()
  email!: string;
}