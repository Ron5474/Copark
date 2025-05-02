'use client'

import { ThemeProvider } from '@mui/material/styles'
import { Box } from "@mui/material";
import { CssBaseline } from "@mui/material";

import theme from "./theme"
import TopBar from "./components/topBar"

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <TopBar />
      </Box>
    </ThemeProvider>
  );
}
