import { Field, ObjectType, InputType, ID } from 'type-graphql'

@ObjectType()
export class Receipt {

  @Field(() => String)
  permitType!: string

  @Field(() => String)
  purchaseDate!: string

  @Field(() => String)
  activeDate!: string

  @Field(() => String)
  expireDate!: string

  @Field(() => Number)
  price!: number
}

@InputType()
export class PurchaseZonePermitInput {

  @Field(() => ID)
  vehicle!: string

  @Field(() => String)
  zone!: string

  @Field(() => Object)
  duration!: {minutes?: number, hours?: number}

  @Field(() => String)
  paymentMethod!: string
}
