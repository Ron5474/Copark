import { Field, ObjectType, InputType, ID } from 'type-graphql'

@ObjectType()
export class Vehicle {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  plate!: string

  @Field(() => String)
  country!: string

  @Field(() => String)
  state!: string

  @Field(() => String, { nullable: true })
  nickname?: string // only visible to the owner
}

@InputType()
export class RegisterVehicleInput {
  @Field(() => String)
  plate!: string

  @Field(() => String)
  country!: string

  @Field(() => String)
  state!: string

  @Field(() => String, { nullable: true })
  nickname?: string
}

@InputType()
export class UpdateVehicleInput {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  country?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  nickname?: string
}

@ObjectType()
export class VehicleID {
  @Field(() => ID)
  id!: string
}

@ObjectType()
export class CreatedVehicle {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  plate!: string

  @Field(() => String, { nullable: true })
  country?: string

  @Field(() => String, { nullable: true })
  state?: string
}


@InputType()
export class createdVehicleInput {
  @Field(() => String)
  plate!: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  state?: string;
}
