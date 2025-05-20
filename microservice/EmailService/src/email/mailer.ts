import nodemailer from 'nodemailer'
import { EmailRequest } from '../types'
import dotenv from 'dotenv'
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') })

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

export const sendEmail = async ({ to, subject, text, html }: EmailRequest) => {
  await transporter.sendMail({
    from: `"CoPark" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  })
}
