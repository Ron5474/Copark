import { Field, ObjectType, InputType, ID } from 'type-graphql'

@ObjectType()
export class Receipt {
  constructor(permitType: string, purchaseDate: string, activeDate: string, expiresDate: string) {
    this.permitType = permitType
    this.purchaseDate = purchaseDate
    this.activeDate = activeDate
    this.expireDate = expiresDate
  }

  @Field(() => String)
  permitType!: string

  @Field(() => String)
  purchaseDate!: string

  @Field(() => String)
  activeDate!: string

  @Field(() => String)
  expireDate!: string
}

@InputType()
export class PurchaseZonePermitInput {

  @Field(() => ID)
  vehicle!: string

  @Field(() => String)
  zone!: string

  @Field(() => String)
  duration!: {minutes?: number, hours?: number}

  @Field(() => String)
  paymentMethod!: string
}
