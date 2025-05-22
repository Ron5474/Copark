'use client'
/**
 * @file AddVehicleView.tsx
 * @description This file contains the AddVehicleView component which is used to display the add vehicle screen
 * @author Swayam Shah
 */

import { Box, Typography } from '@mui/material';
import VehicleForm from './onBoardingVehicleForm';


export default function AddVehicleView() {
  return (<Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.dark",
          pt: 6,
          pb: 3,
          px: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="bold" color="white" gutterBottom align="center">
          Add Your First Vehicle
        </Typography>
        <Typography variant="body2" color="white" textAlign="center" sx={{ mb: 3 }}>
          Let&apos;s get started by adding your vehicle details
        </Typography>
        <picture>
          <source media="(max-width: 600px)" srcSet="/driver/assets/onboardingCar.svg" />
          <img
            src="/driver/assets/onboardingCar.svg"
            alt="Add Vehicle"
            style={{ width: "100%", height: "auto", maxWidth: "400px" }}
          />
        </picture>
      </Box>

      <Box>
        <VehicleForm />
      </Box>
    </Box>)
}