/**
 * @file View.tsx
 * @description This file contains the view for member vehicle zone checkout.
 * @author Bryant Oliver
 */

import { Fragment } from 'react'
import type { NextPage } from 'next'
import { CssBaseline, Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import ShortTermStepper from '../../shortTerm/ProgressStepper'
import TopBar from '../../shared/Topbar'
import MemberVehicles from './Vehicle'
import Footer from '../../shared/Footer'
import theme from '../../theme'

const View: NextPage = () => {
  return (
    <Fragment>
      <CssBaseline />
      <TopBar/>
      <Box sx={{ mt: '90px' }}>
        <ThemeProvider theme={theme}>
        <ShortTermStepper/>
        <MemberVehicles isCheckout={true}/>
        </ThemeProvider>
      </Box>
      <Box sx={{position: 'fixed', bottom: 0, width: '100%'}}>
        <Footer/>
      </Box>
    </Fragment>
  )
}

export default View
