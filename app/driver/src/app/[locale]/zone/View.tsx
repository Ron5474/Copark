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

import { ZoneProvider, ZoneContext, steps } from './Context'
import ShortTermStepper from '../zone/ProgressStepper'
import TopBar from '../shared/Topbar'
import Zone from './Zone'
import Duration from './Duration'
import MemberVehicles from '../vehicle/member/Vehicle'
import Review from './Review'
// import Footer from '../shared/Footer'
import theme from '../theme'


const View: NextPage = () => {
  return (
    <Fragment>
      <CssBaseline />
      {/* <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // minHeight: '100vh',
        }}
      > */}
        <TopBar />
        {/*sorry Bryant, I changed this to make it fit the bottom nav well*/}
        <Box sx={{ /*width: '92%',*/  pb: 9, /*px: 0.25,*/ margin: 'auto', top: 0 }}>
          <ThemeProvider theme={theme}>
            <ZoneProvider>
              <ZoneView />
            </ZoneProvider>
          </ThemeProvider>
        </Box>
        {/* <Footer /> */}
      {/* </Box> */}
    </Fragment>
  )
}

const ZoneView = () => {
  const { currentStep } = useContext(ZoneContext)

  return (
    <Fragment>
      <ShortTermStepper steps={steps} activeStep={currentStep} />
      {(() => {
        switch (currentStep) {
          case 'Zone':
            return <Zone />
          case 'Duration':
            return <Duration />
          case 'Vehicle':
            return <MemberVehicles isCheckout={true} />
          case 'Review':
            return <Review/>
          case 'Payment':
            return <div>Stripe payment page</div>
          default:
            return <div>404 Unknown step</div>
        }
      })()}
    </Fragment>
  )
}

export default View
