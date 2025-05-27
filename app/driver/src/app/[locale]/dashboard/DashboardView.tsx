// // "use client";
// // /**
// //  * @file DashboardView.tsx
// //  * @description This file contains the DashboardView component.
// //  * @author Swayam Shah
// //  */

// // import CardButton from "./components/cardButton";
// // import { useContext } from "react";
// // import { DashboardContext } from "./context";

// // function DashboardView() {
// //   const context = useContext(DashboardContext)
// //   return (
// //     <>
// //       <CardButton icon="/driver/assets/garage.svg" text="Garage" click={() => {context.setCurrentPage('garage')}}/>
// //       {/* <CardButton icon="/driver/assets/Add_car.svg" text="Add Vehicle" click={() => {context.setCurrentPage('add-vehicle')}}/> */}
// //       <CardButton icon="/driver/assets/permit.svg" text="Buy Permit" click={() => {context.setCurrentPage('buy-permit')}}/>
// //     </>
// //   );
// // }

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
import type { LotGroup, Permit } from "../types";
import { Payment } from "../shared/actions";

export default function DashboardView() {
  const t = useTranslations("dashboard");
  const tp = useTranslations("permits");
  const context = useContext(DashboardContext);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedLots, setSelectedLots] = useState<Record<string, string>>({});
  const [permits, setPermits] = useState<LotGroup[]>([]);
  const [activePermits, setActivePermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { getLotDetails } = await import("./permitActions");
      const { getMyPermits } = await import("./permitActions");

      try {
        const [lots, myPermits] = await Promise.all([
          getLotDetails(),
          getMyPermits(),
        ]);

        setPermits(lots);
        setActivePermits(myPermits.active);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      lot: selectedLot.slice(3),
    };
    sessionStorage.setItem("permitDetails", JSON.stringify(permitDetails));

    const paymentDetails = {
      price: lot ? parseFloat(lot.price.slice(1)) * 100 : 0,
      currency: "USD",
    };
    sessionStorage.setItem("paymentDetails", JSON.stringify(paymentDetails));

    if (selectedLot) {
      await Payment(
        "permit",
        selectedLot,
        paymentDetails.price,
        `${permit.id.charAt(0).toUpperCase() + permit.id.slice(1)} Permit for ${selectedLot}`,
        "USD"
      );
    }
  };

  if (loading) {
    return <Typography>{t("loading")}</Typography>;
  }

  return (
    <Box sx={{ pt: 3, px: 2, pb: 7, backgroundColor: "#f8fffe" }}>
      {activePermits.length > 0 && (
        <CardButton
          text={t("activePermits")}
          expanded={expandedId === "active"}
          onToggle={() => toggleExpanded("active")}
          icon=""
          sx={{
            background: "#e3fcef",
            border: "1px solid #66bb6a",
          }}
        >
          <Stack spacing={2}>
            {activePermits.map((permit, idx) => (
              <Box
                key={idx}
                sx={{
                  backgroundColor: "#f1f8e9",
                  border: "1px solid #c5e1a5",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography fontWeight="bold" color="primary.main">
                  {permit.area === "ANY" ? t("allLotsAccess") : permit.type.charAt(0).toUpperCase() + permit.type.slice(1) + " " + permit.area} 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("active")}: {new Date(permit.activeDate!).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("expires")}: {new Date(permit.expireDate).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardButton>
      )}

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {t("title")}
      </Typography>

      {/* Lot Purchase Cards */}
      {permits.map((permit) => (
        <CardButton
          key={permit.id}
          text={tp(permit.title)}
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
                const formattedName = lot.name
                  .toLowerCase()
                  .includes("any")
                  ? t("allLotsAccess")
                  : `${tp("lot")}${lot.name.slice(3)}`;

                return (
                  <FormControlLabel
                    key={lot.name}
                    value={lot.name}
                    control={<Radio />}
                    label={`${formattedName} - ${lot.price}`}
                    aria-label={`Select ${formattedName} from ${tp(permit.title)}`}
                  />
                );
              })}
            </RadioGroup>

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
        text={t("zone")}
        onToggle={() => context.setCurrentPage("buy-permit")}
        expanded={false}
        icon=""
        hideArrow
      />
    </Box>
  );
}

