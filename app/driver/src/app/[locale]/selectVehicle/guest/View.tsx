import { Fragment } from 'react'
import type { NextPage } from 'next'

import TopBar from '../../shared/Topbar'
import GuestVehicle from './Vehicle'
import Footer from '../../shared/Footer'

const View: NextPage = () => {
  return (
    <Fragment>
      <TopBar/>
      <GuestVehicle/>
      <Footer />
    </Fragment>
  )
}

export default View
