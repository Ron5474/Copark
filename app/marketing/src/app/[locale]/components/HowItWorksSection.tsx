import type React from "react"
import { Container, Typography, Grid, Box } from "@mui/material"
// import { DirectionsCar, ConfirmationNumber, Smartphone } from "@mui/icons-material"
import DirectionsCar from "@mui/icons-material/DirectionsCar"
import ConfirmationNumber from "@mui/icons-material/ConfirmationNumber"
import Smartphone from "@mui/icons-material/Smartphone"
import { useTranslations } from "next-intl"

type Props = {
  cta?: React.ReactNode
}

function HowItWorksSection({ cta }: Props) {
  const t = useTranslations("HowItWorksSection")

  const steps = [
    {
      icon: <Smartphone sx={{ fontSize: 32, color: "#00BFA5" }} />,
      title: t("step1.title"),
      description: t("step1.description"),
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 32, color: "#00BFA5" }} />,
      title: t("step2.title"),
      description: t("step2.description"),
    },
    {
      icon: <ConfirmationNumber sx={{ fontSize: 32, color: "#00BFA5" }} />,
      title: t("step3.title"),
      description: t("step3.description"),
    },
  ]

  return (
    <Box id="how-it-works" sx={{ py: 12, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
            {t("heading")}
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 700, mx: "auto" }}>
            {t("subheading")}
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
          {cta}
        </Box>
      </Container>
    </Box>
  )
}

export default HowItWorksSection
