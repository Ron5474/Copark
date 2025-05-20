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
import TopBar from '../shared/Topbar'
import Footer from '../shared/Footer'
import { Box, CssBaseline } from '@mui/material'
import PolicyView from './View'

const Page: NextPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <SessionProvider basePath="/driver/api/auth">
        <CssBaseline />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh'
          }}
        >
          <TopBar />
          <PolicyView />
          <Footer />
        </Box>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default Page