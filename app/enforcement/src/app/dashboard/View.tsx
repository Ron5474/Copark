'use client'

import { Fragment } from 'react'
import type { NextPage } from 'next'

import EnforcementAppBar from './TopBar'
import EnforcementNavBar from '../shared/NavBar'
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
