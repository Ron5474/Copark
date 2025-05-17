export const sendTicketIssuedEmail = async (payload: {
  to: string
  subject: string
  html: string
}) => {
  try {
    await fetch("http://localhost:3015/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error("EmailService failed:", err)
  }
}
