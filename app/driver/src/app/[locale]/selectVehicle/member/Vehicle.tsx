import { Fragment } from 'react'
import {
  Typography,
 } from '@mui/material'

import ShortTermStepper from '../../shortTerm/ProgressStepper'
import AddForm from '../AddForm'

export default function MemberVehicles() {
  return (
    <Fragment>
      <ShortTermStepper/>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          marginTop: '5vh',
        }}
      >
        Which Vehicle?
      </Typography>
      <AddForm/>
    </Fragment>
  )
}
