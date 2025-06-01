import { Field, InputType, ObjectType } from 'type-graphql'

@InputType()
export class RecognizePlateInput {
  @Field(() => String)
  image!: string
}

@ObjectType()
export class RecognizePlateResult {
  @Field(() => String)
  plate!: string

  @Field(() => String)
  state!: string

  @Field(() => Number)
  confidence!: number
}
