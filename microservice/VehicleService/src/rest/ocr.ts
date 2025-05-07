import { Router } from 'express'
import multer from 'multer'
import { createWorker } from 'tesseract.js'
import fs from 'fs'

const upload = multer({ dest: 'uploads/' })
const router = Router()

router.post('/scan', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' })
    return
  }

  const worker = await createWorker()
  try {
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const {
      data: { text }
    } = await worker.recognize(req.file.path)
    await worker.terminate()
    fs.unlinkSync(req.file.path)
    res.json({ plate: text.trim() })
  } catch (err) {
    console.error('OCR error:', err)
    res.status(500).json({ error: 'OCR failed' })
  }
})

export default router
