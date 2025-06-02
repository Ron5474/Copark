import type React from "react"
import { Container, Typography, Grid, Card, CardContent, Box } from "@mui/material"
// import { CreditCard, ConfirmationNumber, DirectionsCar, LocationOn, Schedule, Email } from "@mui/icons-material"
import CreditCard from "@mui/icons-material/CreditCard";
import ConfirmationNumber from "@mui/icons-material/ConfirmationNumber";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import LocationOn from "@mui/icons-material/LocationOn";
import Schedule from "@mui/icons-material/Schedule";
import Email from "@mui/icons-material/Email";
import { useTranslations } from "next-intl"

function FeaturesSection() {
  const t = useTranslations("FeaturesSection")

  const features = [
    {
      icon: <CreditCard sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: t("feature1.title"),
      description: t("feature1.description"),
      details: t("feature1.details"),
    },
    {
      icon: <ConfirmationNumber sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: t("feature2.title"),
      description: t("feature2.description"),
      details: t("feature2.details"),
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: t("feature3.title"),
      description: t("feature3.description"),
      details: t("feature3.details"),
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: t("feature4.title"),
      description: t("feature4.description"),
      details: t("feature4.details"),
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: t("feature5.title"),
      description: t("feature5.description"),
      details: t("feature5.details"),
    },
    {
      icon: <Email sx={{ fontSize: 40, color: "#00BFA5" }} />,
      title: t("feature6.title"),
      description: t("feature6.description"),
      details: t("feature6.details"),
    },
  ]

  return (
    <Box id="features" sx={{ py: 12, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
            {t("heading")}
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 700, mx: "auto" }}>
            {t("subheading")}
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
