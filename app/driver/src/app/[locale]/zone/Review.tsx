/**
 * @file Payment.tsx
 * @description This file contains the Payment step in zone member checkout.
 * @author Bryant Oliver
 */

'use client'

import { useContext } from 'react'
import {
  Box,
  Button,
  Divider,
  Typography,
} from '@mui/material'
// import CloseIcon from '@mui/icons-material/Close'

import ZoneContext from './Context'
import { Payment } from '../shared/actions'
// import AddForm from '../AddForm'
// import Loader from '../shared/Loader'
// import theme from '../theme'
// import { Vehicle } from '../types'
// import { getVehicles } from '../../actions'


export default function Review() {
  const { zoneNumber, /*zoneDetails,*/ durationString, price, vehicle } = useContext(ZoneContext)
  
  const tempLocation = "UCSC Campus"

  const checkout = async () => {
    const amount: number = parseFloat((price + 0.5).toFixed(2))*100 // in cents
    sessionStorage.setItem('zoneNumber', zoneNumber.toString())
    sessionStorage.setItem('durationString', durationString)
    sessionStorage.setItem('price', amount.toString())
    sessionStorage.setItem('vehicle', JSON.stringify(vehicle))
    sessionStorage.setItem('tempLocation', tempLocation)
    sessionStorage.setItem('currency', 'USD')
   
    // TODO: Get information on the permit style chosen and add the type and itemName accordingly
    await Payment("daily" ,"Daily Parking Permit", amount, `Parking permit for zone #${zoneNumber} in ${tempLocation}`, "USD");
  }

  return (
    <Box sx={{
        maxWidth: '92%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: 'auto',
        marginTop: '1vh',
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        fontWeight={600}
      >
        Review Order
      </Typography>

      <Divider sx={{ my: 2 }}/>

      <Box >
        <Typography
          variant="body1"
          gutterBottom
          fontWeight={600}
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

      <Divider sx={{ my: 2 }}/>

      <Box>
        <Typography
          variant="body1"
          gutterBottom
          fontWeight={600}
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

      <Divider sx={{ my: 2 }}/>

      <Box>
        <Typography
          variant="body1"
          gutterBottom
          fontWeight={600}
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

      <Divider sx={{ my: 2 }}/>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          gutterBottom
          fontWeight={600}
        >
          Order Total
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          color="primary"
          fontWeight={600}
        >
          {`$${(price + 0.5).toFixed(2)}`}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="subtitle2"
          gutterBottom
          color="gray"
        >
          Parking taxes may be included in subtotal. This transaction is non-refundable.
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={checkout}
        sx={{
          width: '100%',
          marginTop: '5vh',
          fontSize: '1.15rem',
          color: 'white',
          backgroundColor: "primary",
          textTransform: 'none',
        }}
      >
        Continue to payment
      </Button>

    </Box>
  )
}
