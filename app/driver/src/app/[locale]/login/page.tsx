/*
#######################################################################
#
# Copyright (C) 2025 Copark Inc. All right reserved.
#
# You may not use, distribute, publish, or modify this code without 
# the express written permission of the copyright holder.
#
#######################################################################
*/
"use client"
import type { NextPage } from 'next'
import { ThemeProvider } from '@mui/material/styles'
import { SessionProvider } from 'next-auth/react'

import theme from '../theme'
import LoginView from './View'
import TopBar from '../shared/Topbar'
import Footer from '../shared/Footer'
import { Box, CssBaseline } from '@mui/material'

const Page: NextPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <SessionProvider basePath="/driver/api/auth">
        <CssBaseline />
        <TopBar />
        <Box 
          sx={{ 
            height: '100vh'
          }}>
        <LoginView />
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}>
          <Footer />
        </Box>
        </Box>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default Page