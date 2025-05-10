import { Field, ObjectType, InputType, ID } from 'type-graphql'

@ObjectType()
export class Receipt {

  @Field(() => String)
  type!: string

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
export class PurchaseZoneInput {

  @Field(() => ID)
  vehicle!: string

  @Field(() => String)
  zone!: string

  @Field(() => Object)
  duration!: {minutes?: number, hours?: number}

  @Field(() => String)
  paymentMethod!: string
}

@InputType()
export class IsValidInput {

  @Field(() => ID)
  vehicle!: string
}

@InputType()
export class IsValidPermitInput {

  @Field(() => ID)
  vehicle!: string

  @Field(() => String)
  zone!: string
}


@InputType()
export class IsValid {

  @Field(() => Boolean)
  isValid!: boolean

  @Field(() => String)
  type!: string

  @Field(() => String)
  zone!: string
}
