"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Topbar from "../shared/Topbar";
import { useEffect } from "react";
import { getTransactionDetails, addPaymentDetails, addPermitDetails, addTicketDetails } from "./actions";
import { Box, Button, Toolbar, Typography } from "@mui/material";
import theme from "../theme";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function PaymentConfirmation() {
  const sessionId = useSearchParams().get("session_id");
  // const [transactionId, setTransactionId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const t = useTranslations("paymentConfirmation");

  const handleClick = () => {
    router.push("/dashboard");
  };
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        console.error("No session ID found in URL");
        return;
      }
      const paymentDetails = await getTransactionDetails(sessionId);
      // setTransactionId(paymentDetails.id);

      await addPaymentDetails(paymentDetails);
      const permitDetails = sessionStorage.getItem("permitDetails");
      const ticketDetails = sessionStorage.getItem("ticketDetails");
      let details;
      if (permitDetails) {
        details = JSON.parse(permitDetails);
      } else if (ticketDetails) {
        details = JSON.parse(ticketDetails);
      }
    
      if (details.type === "permit") {
        await addPermitDetails(paymentDetails, details);
      } else if (details.type === "ticket") {
        await addTicketDetails(details);
      }
      sessionStorage.removeItem("permitDetails");
      sessionStorage.removeItem("paymentDetails");
      setConfirmed(true);
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
        <Typography variant="h5" sx={{ fontWeight: 600, color: "green" }}>
          {t("title")}
        </Typography>
        {/* {transactionId && (
        <Typography variant="body1" sx={{ fontWeight: 600, color: "gray" }}>
          {t("transaction")} {transactionId}
        </Typography>)} */}
        <Typography variant="body1" sx={{ fontWeight: 400, color: "black", marginTop: "1rem" }}>
          {t("description.line1")}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 400, color: "black" }}>
          {t("description.line2")}
        </Typography>
        {confirmed && <Button sx={{marginTop: "20%", backgroundColor: theme.palette.primary.main, color: "white", padding: '18px'}} onClick={() => handleClick()}>{t("continue")}</Button>}
      </Box>
    </>
  );
}

export default PaymentConfirmation;