"use client";

import { useSearchParams } from "next/navigation";
import Topbar from "../shared/Topbar";
import { useEffect } from "react";
import { getTransactionDetails } from "./actions";
import { Box, Toolbar } from "@mui/material";

function PaymentConfirmation() {
  const sessionId = useSearchParams().get("session_id");
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        console.error("No session ID found in URL");
        return;
      }
      await getTransactionDetails(sessionId);
    };
    fetchSessionDetails();
  }, [sessionId]);
      
  return (
    <>
      <Topbar />
      <Toolbar />
      <Toolbar />
      <Toolbar />
      <Box sx={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <picture>
        <source srcSet="/driver/assets/tick.svg" type="image/svg+xml" />
        <img src="/driver/assets/tick.svg" alt="payment confirmed" width={300} height={300} aria-label="tick" />
      </picture>

      </Box>
    </>
  );
}

export default PaymentConfirmation;