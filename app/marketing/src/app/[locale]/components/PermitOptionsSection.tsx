import React from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid
} from "@mui/material"

function PermitSection() {
  const plans = [
    {
      title: "Daily Permits",
      description: "Perfect for occasional parking needs",
    },
    {
      title: "Quarterly Permits",
      description: "Best value for regular parkers",
    },
    {
      title: "Yearly Permits",
      description: "Maximum savings for daily parkers",
    },
    {
      title: "Zone Permits",
      description: "Pay as you park flexibility with hourly and minute based options",
    },
  ]

  return (
    <Box id="permits" sx={{ py: 12, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
            Flexible Permit Options
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 700, mx: "auto" }}>
            Choose the permit type that best fits your parking needs. Special discounts available for .edu email users.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {plans.map((plan, index) => (
            <Grid key={index} size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f0fdfa ", border: "2px solid #34d399", }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {plan.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {plan.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default PermitSection
