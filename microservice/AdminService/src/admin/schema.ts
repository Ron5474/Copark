import { IsEmail } from "class-validator";
import { Field, ObjectType, InputType, ID } from "type-graphql";

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
