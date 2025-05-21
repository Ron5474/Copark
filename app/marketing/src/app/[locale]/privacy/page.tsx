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
import type { NextPage } from 'next'

import TopBar from '../components/Topbar'
import Footer from '../components/Footer'
import { Box, CssBaseline } from '@mui/material'
import PolicyView from './View'

const Page: NextPage = () => {
  return (
    <>
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
    </>
  )
}

export default Page