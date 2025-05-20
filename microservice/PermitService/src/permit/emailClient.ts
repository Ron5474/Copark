export const sendPermitEmail = async (payload: {
  to: string
  subject: string
  html: string
}) => {
  try {
    const res = await fetch("http://localhost:3015/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    console.log("EmailService response:", res.status, await res.json())
  } catch (err) {
    console.error("EmailService failed:", err)
  }
}
