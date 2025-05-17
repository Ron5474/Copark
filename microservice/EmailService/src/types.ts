export interface EmailRequest {
  to: string
  subject: string
  text?: string
  html?: string
}
