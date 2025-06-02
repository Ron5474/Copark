import type React from "react"
import { Container, Typography, Grid, Card, CardContent, Box, Avatar, Rating } from "@mui/material"
import { useTranslations } from "next-intl"

function TestimonialSection() {
  const t = useTranslations("TestimonialSection")

  const testimonials = [
    {
      name: t("testimonial1.name"),
      initials: t("testimonial1.initials"),
      text: t("testimonial1.text"),
    },
    {
      name: t("testimonial2.name"),
      initials: t("testimonial2.initials"),
      text: t("testimonial2.text"),
    },
    {
      name: t("testimonial3.name"),
      initials: t("testimonial3.initials"),
      text: t("testimonial3.text"),
    },
  ]

  return (
    <Box id="testimonials" sx={{ py: 12, bgcolor: "background.default" }}>
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
          {testimonials.map((testimonial, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Rating value={5} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}>
                    &quot;{testimonial.text}&quot;
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, pt: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.100", color: "primary.main", fontWeight: 600 }}>
                      {testimonial.initials}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default TestimonialSection
