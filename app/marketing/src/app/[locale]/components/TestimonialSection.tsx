import type React from "react"
import { Container, Typography, Grid, Card, CardContent, Box, Avatar, Rating } from "@mui/material"

function TestimonialSection() {
  const testimonials = [
    {
      name: "Jamie D.",
      initials: "JD",
      rating: 5,
      text: "CoPark has completely transformed how I manage parking permits. The one-click purchase feature saves me so much time, and I love being able to see all my active permits in one place.",
    },
    {
      name: "Alex M.",
      initials: "AM",
      rating: 5,
      text: "As a student, the 10% discount with my .edu email is amazing! The zone parking feature is so convenient for when I need to park downtown for just a few hours.",
    },
    {
      name: "Sarah K.",
      initials: "SK",
      rating: 5,
      text: "The vehicle management feature is fantastic. I can easily switch between my car and motorcycle when purchasing permits. The interface is clean and intuitive.",
    },
  ]

  return (
    <Box id="testimonials" sx={{ py: 12, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
            What Our Users Say
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 700, mx: "auto" }}>
            Thousands of users trust CoPark for their parking permit needs. Here&apos;s what they have to say.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
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
