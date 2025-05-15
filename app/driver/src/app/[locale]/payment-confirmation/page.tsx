"use client";

import { useSearchParams } from "next/navigation";

function PaymentConfirmation() {
  const sessionId = useSearchParams().get("session_id");
  return (
    <div>
      <h1>Payment Confirmation</h1>
      <p>Your payment has been successfully processed.</p>
      <p>Thank you for your purchase!</p>
      <p>Session ID: {sessionId}</p>
    </div>
  );
}

export default PaymentConfirmation;