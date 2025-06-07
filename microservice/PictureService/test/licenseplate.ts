import * as fs from 'fs'
import * as path from 'path'

const imagePath = path.join(__dirname, 'sample_plate.jpg')
const imageBuffer = fs.readFileSync(imagePath)
const plateBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`

export { plateBase64 }
