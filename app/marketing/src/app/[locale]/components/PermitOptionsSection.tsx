import React from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid
} from "@mui/material"
import { useTranslations } from "next-intl"

function PermitSection() {
  const t = useTranslations("PermitSection")

  const plans = [1, 2, 3, 4].map((num) => ({
    title: t(`plan${num}.title`),
    description: t(`plan${num}.description`),
  }))

  return (
    <Box id="permits" sx={{ py: 12, bgcolor: "grey.50" }}>
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
          {plans.map((plan, index) => (
            <Grid key={index} size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f0fdfa", border: "2px solid #34d399", }}>
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
