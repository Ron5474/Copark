'use client'
import { Fragment } from 'react'
import type { NextPage } from 'next'

import EnforcementAppBar from './TopBar'
import EnforcementNavBar from '../shared/NavBar'
import DashboardContent from './Content'
import { EnforcementProvider } from './Context'

const View: NextPage = () => {
  return (
    <EnforcementProvider>
      <Fragment>
        <EnforcementAppBar />
        <DashboardContent />
        <EnforcementNavBar />
      </Fragment>
    </EnforcementProvider>
  )
}

export default View
