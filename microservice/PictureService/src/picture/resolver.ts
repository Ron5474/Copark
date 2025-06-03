import { Arg, Mutation, Resolver, Authorized, Query } from 'type-graphql'
import { RecognizePlateInput, RecognizePlateResult } from './schema'
import { PictureService } from './service'

@Resolver()
export class PictureResolver {
  private service = new PictureService()

  @Authorized(['enforcement'])
  @Mutation(() => RecognizePlateResult)
  async recognizePlate(
    @Arg('input', () => RecognizePlateInput) input: RecognizePlateInput
  ): Promise<RecognizePlateResult> {
    if (!input.image || !input.image.startsWith('data:image')) {
      throw new Error('Invalid image input')
    }
    // console.log("Base64 length:", input.image.length)
    // console.log("Image prefix:", input.image.substring(0, 30))


    return this.service.recognizePlate(input)
  }
}

@Resolver()
export class DummyQueryResolver {
  @Query(() => String)
  ping(): string {
    return 'pong'
  }
}