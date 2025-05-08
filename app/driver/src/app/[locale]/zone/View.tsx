/**
 * @file View.tsx
 * @description This file contains the view for member vehicle zone checkout.
 * @author Bryant Oliver
 */

'use client'

import { Fragment, useContext } from 'react'
import type { NextPage } from 'next'
import { CssBaseline, Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { ZoneContext, steps } from './Context'
import ShortTermStepper from '../zone/ProgressStepper'
import TopBar from '../shared/Topbar'
import Zone from './Zone'
import MemberVehicles from '../selectVehicle/member/Vehicle'
import Footer from '../shared/Footer'
import theme from '../theme'

const View: NextPage = () => {
  const { currentStep } = useContext(ZoneContext)

  return (
    <Fragment>
      <CssBaseline />
      <TopBar/>
      <Box sx={{ width: '92%', margin: 'auto' }}>
        <ThemeProvider theme={theme}>
        <ShortTermStepper steps={steps} activeStep={currentStep}/>

        {(() => {
          switch (currentStep) {
            case 'Zone':
              return <Zone/>
            case 'Duration':
              return <div>Case Y</div>
            case 'Vehicle':
              return <MemberVehicles isCheckout={true}/>
            case 'Payment':
              return <div>Case Y</div>
            case 'Review':
              return <div>Case Y</div>
          }
        })()}

        </ThemeProvider>
      </Box>
      <Box sx={{position: 'fixed', bottom: 0, width: '100%'}}>
        <Footer/>
      </Box>
    </Fragment>
  )
}

export default View
