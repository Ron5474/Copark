import nodemailer from 'nodemailer'
import { EmailRequest } from '../types'
import dotenv from 'dotenv'
import { resolve } from 'path';

const isBuilt = __dirname.includes('/build') || __dirname.includes('\\build');
const p = resolve(__dirname, isBuilt ? '../../../../.prod.env': '../../../../.env')

dotenv.config({ path: p})


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.SMTP_PORT),
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
