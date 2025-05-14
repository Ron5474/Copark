import { Field, InputType, ObjectType } from 'type-graphql'

@InputType()
export class RecognizePlateInput {
  @Field()
  image!: string
}

@ObjectType()
export class RecognizePlateResult {
  @Field()
  plate!: string

  @Field()
  confidence!: number
}
