import { RecognizePlateInput, RecognizePlateResult } from './schema'
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"

export class PictureService {
  private genAI: GoogleGenerativeAI
  private model: GenerativeModel

  constructor() {
    if (!process.env.GOOGLE_GEMINI_KEY) throw Error('No API Key')
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  }

  async recognizePlate(input: RecognizePlateInput): Promise<RecognizePlateResult> {
    const { image } = input
    
    if (!image.startsWith('data:image')) {
      throw new Error('Invalid image format')
    }

      const [mimeType, base64Data] = this.parseBase64Image(image)

      const prompt = `
        Analyze this image and extract the license plate information. 
        Focus ONLY on the license plate text and ignore any other text in the image.
        
        Return the result in this exact JSON format:
        {
          "plate": "extracted_plate_text_here",
          "state": "state_or_province_here",
          "confidence": 85
        }
        
        Rules:
        - Extract only alphanumeric characters from the license plate
        - Remove spaces, dashes, and special characters
        - Return uppercase text
        - If you can't determine the state, return "UNKNOWN"
        - If the plate is invalid or unreadable, return an empty string for "plate"
        - Confidence should be 0-100 based on how clear the plate is
        - If no license plate is visible, return empty plate with 0 confidence
      `

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      
      console.log('Gemini response:', text)
      const plateData = this.parseGeminiResponse(text)
      
      return {
        plate: plateData.plate,
        confidence: plateData.confidence,
        state: plateData.state
      }
  }

  private parseBase64Image(dataUrl: string): [string, string] {
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid data URL format')
    }
    return [matches[1], matches[2]]
  }

  private parseGeminiResponse(text: string): {plate: string, state: string, confidence: number} {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return this.parseTextResponse(text)
  }

  private parseTextResponse(text: string): {plate: string, state: string, confidence: number} {
    const plateMatch = text.match(/plate["\s:]*([A-Z0-9]+)/i)
    const stateMatch = text.match(/state["\s:]*([A-Z]{2,3})/i)
    const confidenceMatch = text.match(/confidence["\s:]*(\d+)/i)

    return {
      plate: plateMatch ? plateMatch[1].toUpperCase() : '',
      state: stateMatch ? stateMatch[1].toUpperCase() : 'UNKNOWN',
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 0
    }
  }
}