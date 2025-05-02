'use client'

import { Fragment } from 'react'
import type { NextPage } from 'next'

import EnforcementAppBar from '../components/DashboardTopBar'
import EnforcementNavBar from '../components/NavBar'
import DashboardContent from './Content'

const View: NextPage = () => {
  return (
    <Fragment>
      <EnforcementAppBar />
      <DashboardContent />
      <EnforcementNavBar />
    </Fragment>
  )
}

export default View
