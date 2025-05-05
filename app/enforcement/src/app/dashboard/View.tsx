'use client'
import { Fragment } from 'react'
import type { NextPage } from 'next'

import EnforcementAppBar from '../shared/TopBar'
import EnforcementNavBar from '../shared/NavBar'
import DashboardContent from './Content'
import { EnforcementProvider } from './context/Context'

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
