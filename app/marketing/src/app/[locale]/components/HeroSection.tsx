"use client"

import type React from "react"
// import { useState } from "react"
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  // Tabs,
  // Tab,
  // Card,
  // CardContent,
  // Radio,
  // RadioGroup,
  // FormControlLabel,
  // TextField,
  // Paper,
} from "@mui/material"
import { ArrowForward, Check, /*Home, ConfirmationNumber, Settings*/ } from "@mui/icons-material"

// interface TabPanelProps {
//   children?: React.ReactNode
//   index: number
//   value: number
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props
//   return (
//     <div role="tabpanel" hidden={value !== index} {...other}>
//       {value === index && <Box>{children}</Box>}
//     </div>
//   )
// }

export default function HeroSection() {
  // const [tabValue, setTabValue] = useState(0)

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setTabValue(newValue)
//   }

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
              <Button 
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: "#000",
                  color: "#fff",
                }}
              >
                Get Started Now
              </Button>
              <Button
               variant="outlined"
               size="large"
               sx={{
                borderColor: "#000",
                color: "#000",
               }}
              >
                Learn More
              </Button>
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
        {/* <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ maxWidth: 400, mx: "auto" }}>
            <Card sx={{
                bgcolor: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: "primary.100",
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ color: "primary.main", fontWeight: "bold" }}>
                  CoPark
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "success.main",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Y
                </Box>
              </Box>
              <CardContent>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                  <Tab label="Daily" />
                  <Tab label="Zone" />
                  <Tab label="Active" />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Daily
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "primary.200",
                      color: "primary.800",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      display: "inline-block",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Quick Access
                    </Typography>
                  </Box>
                  <RadioGroup>
                    <FormControlLabel value="all" control={<Radio />} label="All Lots Access - $15" />
                    <FormControlLabel value="a" control={<Radio />} label="Lot A - $12" />
                    <FormControlLabel value="b" control={<Radio />} label="Lot B - $10" />
                    <FormControlLabel value="c" control={<Radio />} label="Lot C - $8" />
                    <FormControlLabel value="r" control={<Radio />} label="Lot R - $6" />
                  </RadioGroup>
                  <Paper sx={{ bgcolor: "primary.50", p: 2, mt: 2 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Default Vehicle:
                    </Typography>
                    <Typography>YAQ123</Typography>
                  </Paper>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography variant="h4" sx={{ mb: 3 }}>
                      Where are you parking?
                    </Typography>
                    <TextField label="Zone #" fullWidth sx={{ mb: 2 }} />
                    <Button variant="contained" fullWidth sx={{ bgcolor: "primary.main" }}>
                      Confirm Zone
                    </Button>
                  </Box>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Active Permits
                  </Typography>
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography sx={{ color: "text.secondary", mb: 2 }}>No active permits</Typography>
                    <Button variant="contained" sx={{ bgcolor: "primary.main" }}>
                      Purchase a Permit
                    </Button>
                  </Box>
                </TabPanel>
              </CardContent>
              <Box sx={{ bgcolor: "primary.100", p: 2, display: "flex", justifyContent: "space-around" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Home sx={{ color: "primary.main", mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: "primary.main" }}>
                    Home
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <ConfirmationNumber sx={{ color: "text.secondary", mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Permits
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Settings sx={{ color: "text.secondary", mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Settings
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Grid> */}
      </Grid>
    </Container>
  )
}