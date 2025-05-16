"use client";

import { useSearchParams } from "next/navigation";
import Topbar from "../shared/Topbar";
import { useEffect } from "react";
import { getTransactionDetails } from "./actions";

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
    </>
  );
}

export default PaymentConfirmation;