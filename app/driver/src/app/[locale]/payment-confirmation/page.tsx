"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Topbar from "../shared/Topbar";
import { useEffect } from "react";
import { getTransactionDetails } from "./actions";
import { Box, Button, Toolbar, Typography } from "@mui/material";
import theme from "../theme";
import { useRouter } from "@/i18n/navigation";

function PaymentConfirmation() {
  const sessionId = useSearchParams().get("session_id");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const router = useRouter();
  const handleClick = () => {
    router.push("/dashboard");
  };
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        console.error("No session ID found in URL");
        return;
      }
      const details = await getTransactionDetails(sessionId);
      setTransactionId(details.id);
    };
    fetchSessionDetails();
  }, [sessionId]);
      
  return (
    <>
      <Topbar />
      <Toolbar />
      <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10vh", textAlign: "center"}}>
      <picture>
        <source srcSet="/driver/assets/tick.svg" type="image/svg+xml" />
        <img src="/driver/assets/tick.svg" alt="payment confirmed" width={200} height={200} aria-label="tick" />
      </picture>
      <Typography variant="h5" sx={{ fontWeight: 600, color: "green" }}>Payment Confirmed</Typography>
      {transactionId && (
      <Typography variant="body1" sx={{ fontWeight: 600, color: "gray" }}>
        Transaction Id: {transactionId}</Typography>)}
      <Typography variant="body1" sx={{ fontWeight: 400, color: "black", marginTop: "1rem" }}>
        Your payment has been successfully processed. Thank you for your order!</Typography>
      <Typography variant="body1" sx={{ fontWeight: 400, color: "black" }}>
        You will receive a confirmation email shortly.</Typography>
        <Button sx={{marginTop: "20%", backgroundColor: theme.palette.primary.main, color: "white", padding: '18px'}} onClick={() => handleClick()}>Continue to Dashboard</Button>
      </Box>
    </>
  );
}

export default PaymentConfirmation;