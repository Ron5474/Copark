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
import { useState, useContext } from "react";
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
import { DashboardContext } from "./context";

const permits = [
  {
    id: "daily",
    title: "Daily",
    lots: [
      { name: "lot R", price: "$7" },
      { name: "any lot", price: "$15" },
      { name: "lot A", price: "$7" },
      { name: "lot B", price: "$7" },
      { name: "lot C", price: "$7" },
    ],
    priceRange: "$10-15",
  },
  {
    id: "quarterly",
    title: "Quarterly",
    lots: [
      { name: "lot R", price: "$7" },
      { name: "any lot", price: "$15" },
      { name: "lot A", price: "$7" },
      { name: "lot B", price: "$7" },
      { name: "lot C", price: "$7" },
    ],
    priceRange: "$100",
  },
  {
    id: "yearly",
    title: "Yearly",
    lots: [
      { name: "Lot R", price: "$7" },
      { name: "Any lot", price: "$15" },
      { name: "Lot A", price: "$7" },
      { name: "Lot B", price: "$7" },
      { name: "Lot C", price: "$7" },
    ],
    priceRange: "$300",
  },
];

export default function DashboardView() {
  const context = useContext(DashboardContext);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedLots, setSelectedLots] = useState<Record<string, string>>({});

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleLotChange = (permitId: string, lotName: string) => {
    setSelectedLots((prev) => ({
      ...prev,
      [permitId]: lotName,
    }));
  };

  return (
    <Box sx={{ p: 2, pb: 7, }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        aria-label="Available Permits Section"
      >
        Available Permits
      </Typography>
      {permits.map((permit) => (
        <CardButton
          key={permit.id}
          text={`${permit.title} ${permit.priceRange}`}
          expanded={expandedId === permit.id}
          onToggle={() => toggleExpanded(permit.id)}
          icon={""}
        >
          {permit.lots.length > 0 && (
            <Stack spacing={1}>
              <RadioGroup
                value={selectedLots[permit.id] || ""}
                onChange={(e) => handleLotChange(permit.id, e.target.value)}
              >
                {permit.lots.map((lot) => (
                  <FormControlLabel
                    key={lot.name}
                    value={lot.name}
                    control={<Radio />}
                    label={`${lot.name} ${lot.price} dollar`}
                    aria-label={`Select ${lot.name} from ${permit.title}`}
                  />
                ))}
              </RadioGroup>
              <Button
                variant="outlined" sx={{ mt: 2 }}
                aria-label="Purchase Permit"
              >
                  Purchase
              </Button>
            </Stack>
          )}
        </CardButton>
      ))}

      <CardButton
        text="Zone"
        onToggle={() => {
          context.setCurrentPage("buy-permit");
        }}
        expanded={false}
        icon={""}
        hideArrow={true}
      />
    </Box>
  );
}
