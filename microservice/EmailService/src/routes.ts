import express from 'express'
import { sendEmail } from './mailer'
import { EmailRequest } from './types'

const router = express.Router()

router.post('/send', async (req, res) => {
  const payload = req.body as EmailRequest

  try {
    await sendEmail(payload)
    res.status(200).json({ message: 'Email sent.' })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: 'Failed to send email.' })
  }
})

export default router
