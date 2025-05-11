import { Field, ObjectType, InputType, ID} from "type-graphql";

@ObjectType()
export class Ticket {
  @Field(() => ID)
  id!: string;

  @Field(() => String)  
  vehicle!: string;

  @Field(() => String)  
  enforcer!: string;

  @Field(() => Date)  
  issuedDate!: Date;

  @Field(() => String)  
  violation!: string;

  @Field(() => Number)  
  fine!: number;

  @Field(() => String)  
  ticketStatus!: string;

  @Field(() => String, { nullable: true })  
  images?: string;
}

@InputType()
export class NewTicket {
  @Field(() => String)  
  vehicle!: string;

  @Field(() => String)  
  enforcer!: string;

  @Field(() => Number)  
  fine!: number;

  @Field(() => String)  
  violation!: string;

  @Field(() => String, { nullable: true })  
  images?: string;
}

@InputType()
export class TicketInput {
  @Field(() => ID)
  id!: string;
}

@InputType()
export class ModifyTicketInput {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })  
  violation?: string;

  @Field(() => Number, { nullable: true })  
  fine?: number;

  @Field(() => String, { nullable: true })  
  ticketStatus?: string;

  @Field(() => String, { nullable: true })  
  images?: string;
}