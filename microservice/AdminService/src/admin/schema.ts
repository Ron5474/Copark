import { Field, ObjectType, InputType, ID } from "type-graphql";

@ObjectType()
export class EnforcementUser {
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
export class NewEnforcementUser {
  @Field(() => String)  
  name!: string;

  @Field(() => String)  
  email!: string;
}

@InputType()
export class EnforcementUserInput {
  @Field(() => ID)
  id!: string;
}
