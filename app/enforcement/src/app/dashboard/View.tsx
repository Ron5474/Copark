'use client'

import { Fragment } from 'react'
import type { NextPage } from 'next'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from '../theme'

import EnforcementAppBar from '../shared/TopBar'
import DashboardContent from './Content'
import { EnforcementProvider } from './context/Context'

const View: NextPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EnforcementProvider>
        <Fragment>
          <EnforcementAppBar />
          <DashboardContent />
        </Fragment>
      </EnforcementProvider>
    </ThemeProvider>
  )
}

export default View
