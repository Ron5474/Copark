// "use client";
// /**
//  * @file DashboardView.tsx
//  * @description This file contains the DashboardView component.
//  * @author Swayam Shah
//  */

// import CardButton from "./components/cardButton";
// import { useContext } from "react";
// import { DashboardContext } from "./context";

// function DashboardView() {
//   const context = useContext(DashboardContext)
//   return (
//     <>
//       <CardButton icon="/driver/assets/garage.svg" text="Garage" click={() => {context.setCurrentPage('garage')}}/>
//       {/* <CardButton icon="/driver/assets/Add_car.svg" text="Add Vehicle" click={() => {context.setCurrentPage('add-vehicle')}}/> */}
//       <CardButton icon="/driver/assets/permit.svg" text="Buy Permit" click={() => {context.setCurrentPage('buy-permit')}}/>
//     </>
//   );
// }

"use client";

import { useState, useContext, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Radio,
  RadioGroup,
  Typography,
  FormControlLabel,
} from "@mui/material";
import CardButton from "./components/cardButton";
import { useTranslations } from "next-intl";
import { DashboardContext } from "./context";
import type { LotGroup } from "../types";
import { Payment } from "../shared/actions";

export default function DashboardView() {
  const t = useTranslations("dashboard");
  const context = useContext(DashboardContext);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedLots, setSelectedLots] = useState<Record<string, string>>({});
  const [permits, setPermits] = useState<LotGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermits = async () => {
      const { getLotDetails } = await import("./permitActions");
      const data = await getLotDetails();
      setPermits(data);
      setLoading(false);
    };
    fetchPermits();
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleLotChange = (permitId: string, lotName: string) => {
    setSelectedLots((prev) => ({
      ...prev,
      [permitId]: lotName,
    }));
  };

  const checkout = async (permit: LotGroup) => {
    const selectedLot = selectedLots[permit.id];
    const lot = permit.lots.find((lot) => lot.name === selectedLot);
    const permitDetails = {
      type: "permit",
      duration: permit.id,
      permitType: "lot",
      lot: selectedLot.split(" ")[1],
    };
    sessionStorage.setItem("permitDetails", JSON.stringify(permitDetails));
    const paymentDetails = {
      price: lot ? parseFloat(lot.price.slice(1)) * 100 : 0, // Convert to cents
      currency: "USD",
    };
    sessionStorage.setItem("paymentDetails", JSON.stringify(paymentDetails));
    if (selectedLot) {
      await Payment(
        "permit",
        selectedLot,
        lot ? parseFloat(lot.price.slice(1))*100 : 0,
        `${permit.id.charAt(0).toUpperCase() + permit.id.slice(1)} Permit for ${selectedLot}`,
        "USD"
      );
    }
  };

  if (loading) {
    return <Typography>{t("loading")}</Typography>;
  }

  return (
    <Box sx={{ pt: 3, px: 2, pb: 7, backgroundColor: '#f8fffe' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {t("title")}
      </Typography>

      {permits.map((permit) => (
        <CardButton
            key={permit.id}
            text={permit.title}
            expanded={expandedId === permit.id}
            onToggle={() => toggleExpanded(permit.id)}
            icon=""
            badgeText={
              permit.id === "yearly"
                ? t("bestValue")
                : permit.id === "daily"
                ? t("quickAccess")
                : undefined
            }
          >
          <Stack spacing={1}>
            <RadioGroup
              value={selectedLots[permit.id] || ""}
              onChange={(e) => handleLotChange(permit.id, e.target.value)}
            >
              {permit.lots.map((lot) => {
                const formattedName =
                  lot.name.toLowerCase().includes("any") ? t("allLotsAccess") : lot.name;

                return (
                  <FormControlLabel
                    key={lot.name}
                    value={lot.name}
                    control={<Radio />}
                    label={`${formattedName} - ${lot.price}`}
                    aria-label={`Select ${formattedName} from ${permit.title}`}
                  />
                );
              })}
            </RadioGroup>

            {selectedLots[permit.id] && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t("selected")}: <strong>{selectedLots[permit.id]}</strong>
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              sx={{
                mt: 2,
                borderRadius: "8px",
                textTransform: "none",
                color: "#fff",
              }}
              disabled={!selectedLots[permit.id]}
              onClick={() => {
                if (selectedLots[permit.id]) {
                  checkout(permit);
                }
              }}
              aria-label={
                !selectedLots[permit.id]
                  ? `Purchase ${permit.title} permit disabled`
                  : `Purchase ${permit.title} permit enabled`
              }
            >
              {t("purchase")}
            </Button>
          </Stack>
        </CardButton>
      ))}

      <CardButton
        text="Zone"
        onToggle={() => context.setCurrentPage("buy-permit")}
        expanded={false}
        icon=""
        hideArrow
      />
    </Box>
  );
}

