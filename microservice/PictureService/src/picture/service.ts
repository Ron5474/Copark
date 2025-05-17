import { RecognizePlateInput, RecognizePlateResult } from './schema'
import Tesseract from 'tesseract.js'
import sharp from 'sharp'

export class PictureService {
  async recognizePlate(input: RecognizePlateInput): Promise<RecognizePlateResult> {
    const { image } = input

    if (!image.startsWith('data:image')) {
      throw new Error('Invalid image format')
    }

    // Extract base64 string and decode to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Preprocess the image (grayscale, normalize)
    const processedBuffer = await sharp(buffer)
      .grayscale()
      .normalize()
      .toBuffer()

    // OCR with Tesseract
    const result = await Tesseract.recognize(processedBuffer, 'eng', {
      logger: () => {
        // Intentionally empty to silence logs
      },
    })

    // Optional debug log
    console.log('Raw OCR Text:', result.data.text)
    console.log('Confidence:', result.data.confidence)

    // Clean up text: remove non-alphanumeric, uppercase it
    const plate = result.data.text?.replace(/[^A-Z0-9]/gi, '').toUpperCase() || ''
    const confidence = result.data.confidence ?? 0

    return { plate, confidence }
  }
}

