import type React from "react"
import {
  Container,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { Check } from "@mui/icons-material"

type Props = {
  cta?: React.ReactNode
}

export default function HeroSection({ cta }: Props) {

  const benefits = [
    "One-click permit purchases",
    "10% discount for .edu email users",
    "Easily manage multiple vehicles",
    "Flexible permit durations",
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={6} alignItems="center">
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" }, mb: 3 }}>
              Parking Permits{" "}
              <Typography component="span" variant="inherit" sx={{ color: "#00BFA5" }}>
                Made Easy
              </Typography>
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 4, lineHeight: 1.6 }}>
              Purchase and manage parking permits with just a few clicks. Daily, quarterly, yearly, and zone-based
              options available through our web platform.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 4, flexDirection: { xs: "column", sm: "row" } }}>
              {cta}
            </Box>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Why choose CoPark?
              </Typography>
              <List dense>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: "#00BFA5", fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box
            component="img"
            src="/assets/copark-phone.png"
            alt="CoPark phone preview"
            sx={{
              width: "100%",
              maxWidth: 400,
              mx: "auto",
              display: "block",
            }}
          />
        </Grid>
      </Grid>
    </Container>
  )
}