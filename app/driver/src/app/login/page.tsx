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

'use client'

import type { NextPage } from 'next'
import { ThemeProvider } from '@mui/material/styles'

import theme from '../theme'
import LoginView from './View'
import TopBar from '../shared/TopBar'
import Footer from '../shared/Footer'

const Page: NextPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <TopBar />
      <LoginView />
      <Footer />
    </ThemeProvider>
  )
}

export default Page