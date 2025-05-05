/**
 * @file selectVehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

import { Box } from '@mui/material'

import ShortTermStepper from '../../shortTerm/ProgressStepper'
import AddForm from '../AddForm'

export default function GuestVehicle() {
  return (
    <Box sx={{ mt: '90px' }}>
      <ShortTermStepper/>
      <AddForm/>
    </Box>
  )
}
