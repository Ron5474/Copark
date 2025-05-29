import { Field, ObjectType, InputType, ID, Float } from 'type-graphql'

@ObjectType()
export class Permit {

  @Field(() => String)
  vehicle!: string

  @Field(() => String)
  type!: string

  @Field(() => String)
  area!: string

  @Field(() => String)
  purchaseDate?: string

  @Field(() => String)
  activeDate?: string

  @Field(() => String)
  expireDate!: string
}

@ObjectType()
export class MyPermits {

  @Field(() => [Permit])
  future!: Permit[]

  @Field(() => [Permit])
  active!: Permit[]

  @Field(() => [Permit])
  expired!: Permit[]
}

@ObjectType()
export class Duration {
  @Field(() => Number)
  minutes!: number

  @Field(() => Number)
  hours!: number
}

@ObjectType()
export class ZoneDetails {

  @Field(() => Number, { nullable: true })
  hourly?: number

  @Field(() => Duration, { nullable: true })
  maxDuration?: Duration

  @Field(() => String, { nullable: true })
  openTime?: string

  @Field(() => String, { nullable: true })
  closeTime?: string
}

@InputType()
export class ZoneDuration {
  @Field(() => Number)
  minutes!: number

  @Field(() => Number)
  hours!: number
}

@InputType()
export class Zoneday {

  @Field(() => Number, { nullable: true })
  hourly?: number

  @Field(() => ZoneDuration, { nullable: true })
  maxDuration?: ZoneDuration

  @Field(() => String, { nullable: true })
  openTime?: string

  @Field(() => String, { nullable: true })
  closeTime?: string
}

@InputType()
export class NewZone {

  @Field(() => Number)
  zone!: number

  @Field(() => Zoneday)
  weekday!: Zoneday

  @Field(() => Zoneday)
  weekend!: Zoneday

}

@InputType()
export class LotInputDetails {
  @Field(() => Number)
  price!: number

  @Field(() => String, { nullable: true })
  expireDate?: string
}

@InputType()
export class NewLot {

  @Field(() => String)
  lot!: string

  @Field(() => LotInputDetails, { nullable: true })
  daily?: LotInputDetails

  @Field(() => LotInputDetails, { nullable: true })
  quarterly?: LotInputDetails

  @Field(() => LotInputDetails, { nullable: true })
  yearly?: LotInputDetails
}

@ObjectType()
export class Receipt {

  @Field(() => Number)
  service!: number

  @Field(() => Number)
  subTotal!: number

  @Field(() => Number)
  total!: number
}

@ObjectType()
export class Confirmation {

  @Field(() => String)
  type!: string

  @Field(() => String)
  area!: string

  @Field(() => String)
  purchaseDate!: string

  @Field(() => String)
  activeDate!: string

  @Field(() => String)
  expireDate!: string

  @Field(() => Receipt)
  receipt!: Receipt

  @Field(() => String)
  paymentMethod!: string
}



@InputType()
export class DurationInput {
  @Field(() => Number, { nullable: true })
  minutes?: number

  @Field(() => Number, { nullable: true })
  hours?: number
}

@InputType()
export class PurchaseZoneInput {
  @Field(() => ID)
  vehicle!: string

  @Field(() => String)
  zone!: string

  @Field(() => DurationInput)
  duration!: DurationInput

  @Field(() => String)
  paymentMethod!: string

  @Field(() => String)
  transactionId!: string
}


@InputType()
export class PurchaseLotInput {
  @Field(() => ID)
  vehicle!: string

  @Field(() => String)
  lot!: string

  @Field(() => String)
  duration!: string

  @Field(() => String)
  paymentMethod!: string

  @Field(() => String)
  transactionId!: string
}

@ObjectType()
export class CheckedPermit {

  @Field(() => String)
  type!: string

  @Field(() => String)
  area!: string
}

@ObjectType()
export class IsValidPolice {

  @Field(() => Boolean)
  isValid!: boolean
}

@ObjectType()
export class PermitsByDay {
  @Field(() => String)
  date!: string

  @Field(() => [Permit])
  permits!: Permit[]
}

@ObjectType()
export class Lot {
  @Field(() => String)
  name!: string

  @Field(() => String)
  price!: string

  @Field(() => String)
  activeDate?: string

  @Field(() => String)
  expireDate?: string
}

@ObjectType()
export class LotGroup {
  @Field(() => String)
  id!: string

  @Field(() => String)
  title!: string

  @Field(() => [Lot])
  lots!: Lot[]
}

@ObjectType()
export class Zone {
  @Field(() => String)
  zone!: string

  @Field(() => Float)
  hourly!: number

  @Field(() => Duration)
  maxDuration!: Duration

  @Field(() => String)
  openTime!: string

  @Field(() => String)
  closeTime!: string
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

  @Field(() => Number)
  totalPermits!: number
}

@ObjectType()
export class PermitReport {
  @Field(() => Float)
  totalPermits!: number

  @Field(() => Float)
  activePermits!: number

  @Field(() => Float)
  expiredPermits!: number

  @Field(() => Float)
  totalRevenue!: number

  @Field(() => [ZoneStats])
  zoneBreakdown!: ZoneStats[]

  @Field(() => [LotStats])
  lotBreakdown!: LotStats[]
}

@InputType()
export class ZoneInput {
  @Field(() => String)
  zone!: string

  @Field(() => Float)
  hourly?: number

  @Field(() => DurationInput)
  maxDuration?: DurationInput

  @Field(() => String)
  openTime?: string

  @Field(() => String)
  closeTime?: string
}
