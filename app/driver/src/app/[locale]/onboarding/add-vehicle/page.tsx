"use client"
import type { NextPage } from 'next'
import { ThemeProvider } from '@mui/material/styles'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

import theme from '../../theme'
import TopBar from '../../shared/Topbar'
import Footer from '../../shared/Footer'
import {Box, CssBaseline, Toolbar } from '@mui/material'
import AddVehicle from './AddVehicleView'
import SplashScreen from './SplashScreen'
import { OnboardingContext } from './context'

const Page: NextPage = () => {
  const [page, setPage] = useState(0);
  return (
    <ThemeProvider theme={theme}>
      <SessionProvider basePath="/driver/api/auth">
        <CssBaseline />
        <TopBar />
        <Box sx={{
          backgroundColor: "#fdfbff"
        }}>
        <Toolbar />
        <OnboardingContext.Provider value={{ currentPage: page, setCurrentPage: setPage }}>
          {page === 0 && <SplashScreen />}
          {page === 1 && <AddVehicle />}
        </OnboardingContext.Provider>
        </Box>
        <Footer />
      </SessionProvider>
    </ThemeProvider>
  )
}

export default Page