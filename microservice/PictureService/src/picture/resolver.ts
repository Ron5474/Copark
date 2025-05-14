import { Arg, Mutation, Resolver, Authorized } from 'type-graphql'
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
    return this.service.recognizePlate(input)
  }
}
