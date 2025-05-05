import { Fragment } from 'react'

import ShortTermStepper from '../../shortTerm/ProgressStepper'
import AddForm from '../AddForm'

export default function GuestVehicle() {
  return (
    <Fragment>
      <ShortTermStepper/>
      <AddForm/>
    </Fragment>
  )
}
