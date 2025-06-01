import type React from "react"
import { Container, Typography, Grid, Box, Button } from "@mui/material"
import { DirectionsCar, ConfirmationNumber, ArrowForward, Smartphone } from "@mui/icons-material"


function HowItWorksSection() {
  const steps = [
    {
      icon: <Smartphone sx={{ fontSize: 32, color: "#00BFA5" }} />,
      title: "1. Sign Up",
      description: "Create your CoPark account using your email.",
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 32, color: "#00BFA5" }} />,
      title: "2. Add Your Vehicle",
      description: "Enter your vehicle details and create a nickname for easy identification.",
    },
    {
      icon: <ConfirmationNumber sx={{ fontSize: 32, color: "#00BFA5"}} />,
      title: "3. Purchase Permits",
      description: "Select your preferred permit type and complete your purchase with one click.",
    },
  ]

  return (
    <Box id="how-it-works" sx={{ py: 12, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
            How CoPark Works
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 700, mx: "auto" }}>
            Getting started with CoPark is quick and easy. Follow these simple steps to manage your parking permits.
          </Typography>
        </Box>
        <Grid container spacing={6}>
          {steps.map((step, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "primary.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  {step.icon}
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {step.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
                backgroundColor: "black",
                color: "white",
                "&:hover": {
                backgroundColor: "#333",
                },
                px: 4,
            }}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default HowItWorksSection
