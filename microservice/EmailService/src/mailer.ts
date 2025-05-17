import nodemailer from 'nodemailer'
import { EmailRequest } from './types'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendEmail = async ({ to, subject, text, html }: EmailRequest) => {
  await transporter.sendMail({
    from: `"CoPark" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  })
}
