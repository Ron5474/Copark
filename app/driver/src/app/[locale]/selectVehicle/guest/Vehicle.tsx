/**
 * @file Vehicle.tsx
 * @description This file contains the Vehicle page for zone guest checkout.
 * @author Bryant Oliver
 */

'use client'

import { Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import ShortTermStepper from '../../shortTerm/ProgressStepper'
import AddForm from '../AddForm'
import theme from '../../theme'

export default function GuestVehicle() {
  return (
    <Box sx={{ mt: '90px' }}>
      <ThemeProvider theme={theme}>
      <ShortTermStepper/>
      <AddForm isGuest={true}/>
      </ThemeProvider>
    </Box>
  )
}
