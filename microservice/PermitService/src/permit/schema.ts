import { Field, ObjectType, /*InputType, */ID } from 'type-graphql'

@ObjectType()
export class Permit {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  permitType!: string

  @Field(() => String)
  purchaseDate!: string

  @Field(() => String)
  expiresDate!: string

  // @Field(() => String)
  // price!: string

  // @Field(() => String)
  // paymentMethod!: string
}
