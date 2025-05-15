/**
 * @file Payment.tsx
 * @description This file contains the Payment step in zone member checkout.
 * @author Bryant Oliver
 */

'use client'

import { Fragment, /*useEffect, useState,*/ useContext } from 'react'
import {
  Box,
  // Button,
  // Dialog,
  // DialogContent,
  // FormControlLabel,
  // IconButton,
  // Radio,
  // RadioGroup,
  Typography,
} from '@mui/material'
// import CloseIcon from '@mui/icons-material/Close'

import ZoneContext from './Context'
// import AddForm from '../AddForm'
// import Loader from '../shared/Loader'
// import theme from '../theme'
// import { Vehicle } from '../types'
// import { getVehicles } from '../../actions'


export default function Review() {
  const { zoneNumber, /*zoneDetails,*/ durationString, price, vehicle } = useContext(ZoneContext)
  
  const tempLocation = "UCSC Campus"

  return (
    <Fragment>
      <Box sx={{
          maxWidth: '92%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 'auto',
          marginTop: '1vh',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
        >
          Review Order
        </Typography>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
          >
            Zone
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
          >
            {`Zone # ${zoneNumber}`}
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
          >
            {`Location: ${tempLocation}`}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
          >
            Duration
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
          >
            {`${durationString}`}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
          >
            Vehicle
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
          >
            {`${vehicle?.nickname} - ${vehicle?.plate} (${vehicle?.state})`}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
          >
            Parking Subtotal
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
          >
            {`$${price.toFixed(2)}`}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
          >
            Transaction Fee
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
          >
            {`$${0.5.toFixed(2)}`}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
          >
            Order Total
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
          >
            {`$${(price + 0.5).toFixed(2)}`}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="subtitle1"
            gutterBottom
            color="gray"
          >
            Parking taxes may be included in subtotal. This transaction is non-refundable.
          </Typography>
        </Box>

      </Box>
    </Fragment>
  )
}
