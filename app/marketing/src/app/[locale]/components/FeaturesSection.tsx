import type React from "react"
import { Container, Typography, Grid, Card, CardContent, Box } from "@mui/material"
import { CreditCard, ConfirmationNumber, DirectionsCar, LocationOn, Schedule, Email } from "@mui/icons-material"

function FeaturesSection() {
  const features = [
    {
      icon: <CreditCard sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: "One-Click Purchase",
      description: "Buy permits instantly with our streamlined one-click purchase process.",
      details:
        "Your default vehicle is set during signup, so you can purchase permits with a single click fast, simple, and hassle-free.",
    },
    {
      icon: <ConfirmationNumber sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: "Active Permit Tracking",
      description: "Easily view and manage all your active parking permits in one place.",
      details: "Never lose track of your permits again.",
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: "Vehicle Management",
      description: "Add multiple vehicles and customize their nicknames for easy identification.",
      details:
        "Switch between vehicles effortlessly and set your default vehicle.",
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: "Zone Permits",
      description: "Purchase permits by zone for hourly and minute-based parking needs.",
      details:
        "Zone system makes it easy to park in designated areas with flexible timing options.",
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: "Flexible Duration Options",
      description: "Choose from daily, quarterly, or yearly permits to fit your needs.",
      details:
        "Whether you need parking for a day or a year, CoPark has flexible options to accommodate your schedule.",
    },
    {
      icon: <Email sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: "Student Discounts",
      description: "10% off all permits for users with .edu email addresses.",
      details:
        "We support education by offering special discounts to students and faculty members with valid academic emails.",
    },
  ]

  return (
    <Box id="features" sx={{ py: 12, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
            Parking Made Simple
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 700, mx: "auto" }}>
            CoPark streamlines the parking experience with powerful features designed for convenience and ease of use.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Card sx={{ height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" }, }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    {feature.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                    {feature.details}
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

export default FeaturesSection
