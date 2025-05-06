/**
 * @file selectVehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

import { Fragment } from 'react'
import type { NextPage } from 'next'
import { CssBaseline, Box } from '@mui/material'

import TopBar from '../../shared/Topbar'
import MemberVehicles from './Vehicle'
import Footer from '../../shared/Footer'

const View: NextPage = () => {
  return (
    <Fragment>
      <CssBaseline />
      <TopBar/>
      <MemberVehicles/>
      <Box sx={{position: 'fixed', bottom: 0, width: '100%'}}>
        <Footer/>
      </Box>
    </Fragment>
  )
}

export default View
