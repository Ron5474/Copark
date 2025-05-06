/**
 * @file selectVehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

import { Fragment } from 'react'
import type { NextPage } from 'next'
import { CssBaseline } from '@mui/material'

import TopBar from '../../shared/Topbar'
import GuestVehicle from './Vehicle'
import Footer from '../../shared/Footer'

const View: NextPage = () => {
  return (
    <Fragment>
      <CssBaseline />
      <TopBar/>
      <GuestVehicle/>
      <Footer />
    </Fragment>
  )
}

export default View
