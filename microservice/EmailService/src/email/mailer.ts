import nodemailer from 'nodemailer'
import { EmailRequest } from '../types'
import dotenv from 'dotenv'
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') })
console.log("EMAIL_HOST:", process.env.EMAIL_HOST)
console.log("SMTP_PORT:", process.env.SMTP_PORT)
console.log("EMAIL_USER:", process.env.EMAIL_USER)

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendEmail = async ({ to, subject, text, html }: EmailRequest) => {
  console.log("EMAIL_HOST:", process.env.EMAIL_HOST)
  console.log("SMTP_PORT:", process.env.SMTP_PORT)
  console.log("EMAIL_USER:", process.env.EMAIL_USER)
  console.log("EMAIL_PASS is set:", !!process.env.EMAIL_PASS)
  await transporter.sendMail({
    from: `"CoPark" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  })
}
