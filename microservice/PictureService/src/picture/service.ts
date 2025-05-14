import { RecognizePlateInput, RecognizePlateResult } from './schema'
import Tesseract from 'tesseract.js'

export class PictureService {
  async recognizePlate(input: RecognizePlateInput): Promise<RecognizePlateResult> {
    const { image } = input

    if (!image.startsWith('data:image')) {
      throw new Error('Invalid image format')
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: () => {
        // nothing typescript, leave me alone
      },
    })

    const plate = result.data.text.replace(/\s/g, '').toUpperCase()
    const confidence = result.data.confidence ?? 0

    return { plate, confidence }
  }
}
