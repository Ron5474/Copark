'use client';

import { ThemeProvider } from '@mui/material/styles'

import HomeView from "./HomeView"
import theme from "./theme"


export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <HomeView />
    </ThemeProvider>
  );
}
